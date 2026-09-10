"use server"

import { createClient } from "@/lib/supabase/server"
import { planLessonReconcile, type LessonPatch, type ReconcileStudent } from "@/lib/admin/lessons"
import { studioNow } from "@/lib/studio-time"
import { revalidatePath } from "next/cache"

const DURATIONS = [30, 45, 60]
const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"]

function revalidateStudentViews() {
  revalidatePath("/admin/students")
  revalidatePath("/admin/teachers")
  revalidatePath("/admin/schedule")
  revalidatePath("/admin/money")
  revalidatePath("/admin")
}

function optionalText(formData: FormData, field: string) {
  return ((formData.get(field) as string) || "").trim() || null
}

/**
 * Name, level, and guardian contact. Every field except the name may be
 * blank. Lesson length lives on the teacher sections (student panel), so it
 * is deliberately not parsed here — editing details never touches it.
 */
function parseStudentFields(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim()
  if (!name) return { error: "Enter the student's name." as const }

  const experienceRaw = (formData.get("experience_level") as string) || ""

  return {
    student: {
      name,
      experience_level: EXPERIENCE_LEVELS.includes(experienceRaw) ? experienceRaw : null,
      contact_name: optionalText(formData, "contact_name"),
      contact_phone: optionalText(formData, "contact_phone"),
      contact_email: optionalText(formData, "contact_email"),
    },
  }
}

interface SlotInput {
  day_of_week: number
  lesson_time: string
  teacher_id: string | null
  duration_minutes: number
  rate_cents: number | null
}

interface SectionInput {
  /** NULL = the section's slots have no teacher. */
  teacher_id: string | null
  duration_minutes: number
  rate_cents: number | null
  slots: SlotInput[]
}

/**
 * Teacher sections arrive as a JSON field from TeacherSectionsEditor:
 * [{"teacher":"<uuid>|","duration":"30","rate":"45"|"","rows":[{"day":1,"time":"16:00"}]}, …]
 * Each section is one teacher's arrangement (length + rate + weekly days).
 * The FIRST section doubles as the student's default teacher and standing
 * billing. At most one slot per weekday across all sections (DB constraint).
 */
function parseSectionFields(formData: FormData): { sections: SectionInput[] } | { error: string } {
  const raw = ((formData.get("sections") as string) || "").trim()
  if (!raw) return { sections: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { error: "Teacher sections could not be read — try again." }
  }
  if (!Array.isArray(parsed) || parsed.length > 20) {
    return { error: "Teacher sections could not be read — try again." }
  }

  const sections: SectionInput[] = []
  const seenDays = new Set<number>()
  const seenTeachers = new Set<string>()
  for (const entry of parsed) {
    const teacherRaw = String((entry as { teacher?: unknown })?.teacher || "").trim()
    const teacherId = teacherRaw || null
    const teacherKey = teacherRaw || "none"
    if (seenTeachers.has(teacherKey)) return { error: "Each teacher can only have one section." }
    seenTeachers.add(teacherKey)

    const duration = Number.parseInt(String((entry as { duration?: unknown })?.duration ?? ""))
    if (!DURATIONS.includes(duration)) return { error: "Choose a valid lesson length for each teacher." }

    const rateRaw = String((entry as { rate?: unknown })?.rate ?? "").trim()
    let rateCents: number | null = null
    if (rateRaw) {
      const rate = Number.parseFloat(rateRaw)
      if (Number.isNaN(rate) || rate < 0) return { error: "Enter a valid rate for each teacher." }
      rateCents = Math.round(rate * 100)
    }

    const rowsRaw = (entry as { rows?: unknown })?.rows
    if (!Array.isArray(rowsRaw) || rowsRaw.length > 7) {
      return { error: "Weekly days could not be read — try again." }
    }
    const slots: SlotInput[] = []
    for (const row of rowsRaw) {
      const day = Number((row as { day?: unknown })?.day)
      const time = String((row as { time?: unknown })?.time || "")
      if (!Number.isInteger(day) || day < 0 || day > 6) return { error: "Choose a valid lesson day." }
      if (!/^\d{2}:\d{2}$/.test(time)) return { error: "Choose a time for each lesson day." }
      if (seenDays.has(day)) return { error: "A student can only have one lesson per weekday." }
      seenDays.add(day)
      slots.push({
        day_of_week: day,
        lesson_time: time,
        teacher_id: teacherId,
        duration_minutes: duration,
        rate_cents: rateCents,
      })
    }
    sections.push({ teacher_id: teacherId, duration_minutes: duration, rate_cents: rateCents, slots })
  }
  return { sections }
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient()

  const parsed = parseStudentFields(formData)
  if ("error" in parsed) return { error: parsed.error }

  const sectionsParsed = parseSectionFields(formData)
  if ("error" in sectionsParsed) return { error: sectionsParsed.error }
  const sections = sectionsParsed.sections
  const firstSection = sections[0]
  const slots = sections.flatMap((section) => section.slots)

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      ...parsed.student,
      preferred_lesson_duration: firstSection?.duration_minutes ?? 30,
      teacher_id: firstSection?.teacher_id ?? null,
      parent_id: null,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  if (firstSection) {
    // The first section doubles as the student's standing billing default.
    const { error: billingError } = await supabase.from("student_billing").upsert({
      student_id: student.id,
      rate_cents: firstSection.rate_cents ?? 0,
      duration_minutes: firstSection.duration_minutes,
    })
    if (billingError) return { error: billingError.message }
  }
  if (slots.length > 0) {
    const { error: slotsError } = await supabase
      .from("student_slots")
      .insert(slots.map((slot) => ({ student_id: student.id, ...slot })))
    if (slotsError) return { error: slotsError.message }
  }

  revalidateStudentViews()
  return { success: true }
}

/** Edit-details dialog: name, level, guardian contact. Scheduling is untouched. */
export async function updateStudent(studentId: string, formData: FormData) {
  const supabase = await createClient()

  const parsed = parseStudentFields(formData)
  if ("error" in parsed) return { error: parsed.error }

  const { error } = await supabase.from("students").update(parsed.student).eq("id", studentId)
  if (error) return { error: error.message }

  revalidateStudentViews()
  return { success: true }
}

export async function updateStudentNotes(studentId: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("students").update({ notes }).eq("id", studentId)

  if (error) return { error: error.message }

  revalidateStudentViews()
  return { success: true }
}

/** What a hard delete takes with it — shown in the panel's confirm step. */
export async function getStudentDeleteImpact(studentId: string) {
  const supabase = await createClient()
  const [lessonsRes, invoicesRes, paidRes] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("student_id", studentId),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("student_id", studentId),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("status", "paid"),
  ])
  return {
    lessons: lessonsRes.count ?? 0,
    invoices: invoicesRes.count ?? 0,
    paidInvoices: paidRes.count ?? 0,
  }
}

/**
 * Permanently delete a student. Weekly slots, billing, lessons, and invoices
 * all cascade with the row — this erases their history, which is why the
 * panel gates it behind an explicit confirm. Students who simply stopped
 * should be marked inactive instead, which keeps every record.
 */
export async function deleteStudent(studentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("students").delete().eq("id", studentId).select("id")
  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: "Student not found." }

  revalidateStudentViews()
  return { success: true }
}

/**
 * Pausing a student clears their upcoming weekly lessons off the schedule
 * (unmarked, generated ones only — one-off lessons the admin booked by hand
 * stay). Reactivating regenerates the weekly lessons from their slots.
 */
export async function toggleStudentActive(studentId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from("students").update({ is_active: isActive }).eq("id", studentId)

  if (error) return { error: error.message }

  if (!isActive) {
    const { error: pruneError } = await supabase
      .from("bookings")
      .delete()
      .eq("student_id", studentId)
      .eq("is_recurring", true)
      .is("attendance", null)
      .in("status", ["confirmed", "pending"])
      .gte("start_time", studioNow().toISOString())
    if (pruneError) return { error: pruneError.message }
  }

  revalidateStudentViews()
  return { success: true }
}

/**
 * Save from the student slide-over panel: teacher sections (each teacher's
 * days, length, and rate) plus internal notes in one go. No sections removes
 * the billing record and all slots. The first section is the student's
 * default teacher and standing billing.
 *
 * Upcoming lessons are then reconciled with the new slots right away (the
 * admin pages also do this on every load — see ensureLessons): confirmed
 * weekly lessons move to the slot's time, dropped days disappear, and past
 * or attendance-marked lessons are never touched so past months' teacher
 * pay and income reports never drift.
 */
export async function saveStudentPanel(studentId: string, formData: FormData) {
  const supabase = await createClient()

  const sectionsParsed = parseSectionFields(formData)
  if ("error" in sectionsParsed) return { error: sectionsParsed.error }
  const sections = sectionsParsed.sections
  const firstSection = sections[0]
  const slots = sections.flatMap((section) => section.slots)

  const teacherId = firstSection?.teacher_id ?? null
  const notes = ((formData.get("notes") as string) || "").trim() || null

  const { data: existing, error: studentError } = await supabase
    .from("students")
    .select("id, teacher_id")
    .eq("id", studentId)
    .single()
  if (studentError || !existing) return { error: "Student not found." }

  // Billing: any teacher section keeps the record; none removes it.
  if (firstSection) {
    const { error: billingError } = await supabase.from("student_billing").upsert({
      student_id: studentId,
      rate_cents: firstSection.rate_cents ?? 0,
      duration_minutes: firstSection.duration_minutes,
    })
    if (billingError) return { error: billingError.message }
  } else {
    const { error: billingError } = await supabase.from("student_billing").delete().eq("student_id", studentId)
    if (billingError) return { error: billingError.message }
  }

  // Slots: upsert per weekday (keeps created_at on unchanged days), drop removed days.
  if (slots.length > 0) {
    const { error: slotsError } = await supabase.from("student_slots").upsert(
      slots.map((slot) => ({ student_id: studentId, ...slot })),
      { onConflict: "student_id,day_of_week" },
    )
    if (slotsError) return { error: slotsError.message }

    const keptDays = slots.map((slot) => slot.day_of_week)
    const { error: pruneError } = await supabase
      .from("student_slots")
      .delete()
      .eq("student_id", studentId)
      .not("day_of_week", "in", `(${keptDays.join(",")})`)
    if (pruneError) return { error: pruneError.message }
  } else {
    const { error: pruneError } = await supabase.from("student_slots").delete().eq("student_id", studentId)
    if (pruneError) return { error: pruneError.message }
  }

  const { error: updateError } = await supabase
    .from("students")
    .update({ notes, teacher_id: teacherId })
    .eq("id", studentId)
  if (updateError) return { error: updateError.message }

  // Reconcile only FUTURE lessons so past months' pay and income never drift.
  // Weekly lessons follow the shared roster rules (planLessonReconcile);
  // one-off lessons follow the default teacher only when it changed.
  const [futureRes, freshRes] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "id, start_time, end_time, teacher_id, rate_cents, is_recurring, recurring_day_of_week, status, attendance",
      )
      .eq("student_id", studentId)
      .gte("start_time", studioNow().toISOString()),
    supabase
      .from("students")
      .select("is_active, teacher_id, billing:student_billing(*), slots:student_slots(*)")
      .eq("id", studentId)
      .single(),
  ])
  if (futureRes.error) return { error: futureRes.error.message }
  if (freshRes.error || !freshRes.data) return { error: "Student not found." }
  const fresh: ReconcileStudent = {
    is_active: freshRes.data.is_active,
    teacher_id: freshRes.data.teacher_id ?? null,
    billing: Array.isArray(freshRes.data.billing)
      ? (freshRes.data.billing[0] ?? null)
      : (freshRes.data.billing ?? null),
    slots: freshRes.data.slots || [],
  }

  const toDelete: string[] = []
  for (const booking of futureRes.data || []) {
    let patch: LessonPatch = {}
    if (!booking.is_recurring || booking.recurring_day_of_week === null) {
      if (booking.status === "cancelled" || booking.attendance) continue
      if (existing.teacher_id !== teacherId && booking.teacher_id === existing.teacher_id) {
        patch.teacher_id = teacherId
      }
    } else {
      const plan = planLessonReconcile(booking, fresh)
      if (!plan) continue
      if (plan.action === "delete") {
        toDelete.push(booking.id)
        continue
      }
      patch = plan.patch
    }

    if (Object.keys(patch).length === 0) continue
    const { error: restampError } = await supabase.from("bookings").update(patch).eq("id", booking.id)
    if (restampError) return { error: restampError.message }
  }

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from("bookings").delete().in("id", toDelete)
    if (deleteError) return { error: deleteError.message }
  }

  revalidateStudentViews()
  return { success: true }
}
