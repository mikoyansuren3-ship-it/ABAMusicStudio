"use server"

import { createClient } from "@/lib/supabase/server"
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

/** Every field except the name may be blank. */
function parseStudentFields(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim()
  if (!name) return { error: "Enter the student's name." as const }

  const experienceRaw = (formData.get("experience_level") as string) || ""
  const durationRaw = Number.parseInt((formData.get("duration") as string) || "")

  return {
    student: {
      name,
      experience_level: EXPERIENCE_LEVELS.includes(experienceRaw) ? experienceRaw : null,
      preferred_lesson_duration: DURATIONS.includes(durationRaw) ? durationRaw : 30,
      contact_name: optionalText(formData, "contact_name"),
      contact_phone: optionalText(formData, "contact_phone"),
      contact_email: optionalText(formData, "contact_email"),
    },
  }
}

interface SlotInput {
  day_of_week: number
  lesson_time: string
  /** NULL = use the student's default teacher / billing. */
  teacher_id: string | null
  duration_minutes: number | null
  rate_cents: number | null
}

/**
 * Weekly slots arrive as a JSON field:
 * [{"day":1,"time":"16:00","teacher":"<uuid>|default","duration":"30"|"","rate":"45"|""}, …].
 * At most one slot per weekday (mirrors the DB unique constraint). Teacher,
 * duration, and rate are per-slot overrides; blank/default falls back to the
 * student's own teacher and standing billing.
 */
function parseSlotFields(formData: FormData): { slots: SlotInput[] } | { error: string } {
  const raw = ((formData.get("slots") as string) || "").trim()
  if (!raw) return { slots: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { error: "Weekly slots could not be read — try again." }
  }
  if (!Array.isArray(parsed) || parsed.length > 7) {
    return { error: "Weekly slots could not be read — try again." }
  }

  const slots: SlotInput[] = []
  const seenDays = new Set<number>()
  for (const entry of parsed) {
    const day = Number((entry as { day?: unknown })?.day)
    const time = String((entry as { time?: unknown })?.time || "")
    const teacherRaw = String((entry as { teacher?: unknown })?.teacher || "").trim()
    const durationRaw = String((entry as { duration?: unknown })?.duration ?? "").trim()
    const rateRaw = String((entry as { rate?: unknown })?.rate ?? "").trim()
    if (!Number.isInteger(day) || day < 0 || day > 6) return { error: "Choose a valid lesson day." }
    if (!/^\d{2}:\d{2}$/.test(time)) return { error: "Choose a time for each lesson day." }
    if (seenDays.has(day)) return { error: "A student can only have one lesson per weekday." }
    seenDays.add(day)

    let durationMinutes: number | null = null
    if (durationRaw) {
      const duration = Number.parseInt(durationRaw)
      if (!DURATIONS.includes(duration)) return { error: "Choose a valid lesson length for each day." }
      durationMinutes = duration
    }
    let rateCents: number | null = null
    if (rateRaw) {
      const rate = Number.parseFloat(rateRaw)
      if (Number.isNaN(rate) || rate < 0) return { error: "Enter a valid rate for each day." }
      rateCents = Math.round(rate * 100)
    }
    slots.push({
      day_of_week: day,
      lesson_time: time,
      teacher_id: teacherRaw && teacherRaw !== "default" ? teacherRaw : null,
      duration_minutes: durationMinutes,
      rate_cents: rateCents,
    })
  }
  return { slots }
}

/** "none"/blank → null, otherwise the teacher's UUID. */
function parseTeacherField(formData: FormData) {
  const raw = ((formData.get("teacher_id") as string) || "").trim()
  return raw && raw !== "none" ? raw : null
}

function parseRateField(formData: FormData): { rateCents: number | null } | { error: string } {
  const raw = ((formData.get("rate") as string) || "").trim()
  if (!raw) return { rateCents: null }
  const rate = Number.parseFloat(raw)
  if (Number.isNaN(rate) || rate < 0) return { error: "Enter a valid rate." }
  return { rateCents: Math.round(rate * 100) }
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient()

  const parsed = parseStudentFields(formData)
  if ("error" in parsed) return { error: parsed.error }

  const rateParsed = parseRateField(formData)
  if ("error" in rateParsed) return { error: rateParsed.error }

  const { data: student, error } = await supabase
    .from("students")
    .insert({ ...parsed.student, parent_id: null })
    .select("id")
    .single()

  if (error) return { error: error.message }

  if (rateParsed.rateCents !== null) {
    const { error: billingError } = await supabase.from("student_billing").upsert({
      student_id: student.id,
      rate_cents: rateParsed.rateCents,
      duration_minutes: parsed.student.preferred_lesson_duration,
    })
    if (billingError) return { error: billingError.message }
  }

  revalidateStudentViews()
  return { success: true }
}

export async function updateStudent(studentId: string, formData: FormData) {
  const supabase = await createClient()

  const parsed = parseStudentFields(formData)
  if ("error" in parsed) return { error: parsed.error }

  const { error } = await supabase.from("students").update(parsed.student).eq("id", studentId)
  if (error) return { error: error.message }

  // Keep an existing billing row's duration in step with the edited duration.
  const { data: billing } = await supabase
    .from("student_billing")
    .select("student_id")
    .eq("student_id", studentId)
    .maybeSingle()
  if (billing) {
    const { error: billingError } = await supabase
      .from("student_billing")
      .update({ duration_minutes: parsed.student.preferred_lesson_duration })
      .eq("student_id", studentId)
    if (billingError) return { error: billingError.message }
  }

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

export async function toggleStudentActive(studentId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from("students").update({ is_active: isActive }).eq("id", studentId)

  if (error) return { error: error.message }

  revalidateStudentViews()
  return { success: true }
}

/**
 * Save from the student slide-over panel: teacher, rate, duration, weekly
 * slots, and internal notes in one go. Rate blank AND no slots removes the
 * billing record (and all slots). Changing the teacher re-stamps only FUTURE
 * lessons, so past months' teacher pay reports never drift.
 */
export async function saveStudentPanel(studentId: string, formData: FormData) {
  const supabase = await createClient()

  const durationRaw = Number.parseInt((formData.get("duration") as string) || "")
  const duration = DURATIONS.includes(durationRaw) ? durationRaw : 30

  const rateParsed = parseRateField(formData)
  if ("error" in rateParsed) return { error: rateParsed.error }

  const slotsParsed = parseSlotFields(formData)
  if ("error" in slotsParsed) return { error: slotsParsed.error }

  const teacherId = parseTeacherField(formData)
  const notes = ((formData.get("notes") as string) || "").trim() || null

  const { data: existing, error: studentError } = await supabase
    .from("students")
    .select("id, teacher_id")
    .eq("id", studentId)
    .single()
  if (studentError || !existing) return { error: "Student not found." }

  // Billing: any rate or slot keeps the record; all blank removes it.
  if (rateParsed.rateCents !== null || slotsParsed.slots.length > 0) {
    const { error: billingError } = await supabase.from("student_billing").upsert({
      student_id: studentId,
      rate_cents: rateParsed.rateCents ?? 0,
      duration_minutes: duration,
    })
    if (billingError) return { error: billingError.message }
  } else {
    const { error: billingError } = await supabase.from("student_billing").delete().eq("student_id", studentId)
    if (billingError) return { error: billingError.message }
  }

  // Slots: upsert per weekday (keeps created_at on unchanged days), drop removed days.
  if (slotsParsed.slots.length > 0) {
    const { error: slotsError } = await supabase.from("student_slots").upsert(
      slotsParsed.slots.map((slot) => ({ student_id: studentId, ...slot })),
      { onConflict: "student_id,day_of_week" },
    )
    if (slotsError) return { error: slotsError.message }

    const keptDays = slotsParsed.slots.map((slot) => slot.day_of_week)
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

  // Re-stamp only FUTURE lessons so past months' pay and income never drift.
  // Recurring lessons take their slot's teacher/rate/duration (slot overrides
  // fall back to the student's default teacher and standing billing); one-off
  // lessons follow the default teacher only when it changed.
  const { data: futureBookings, error: futureError } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, teacher_id, rate_cents, is_recurring, recurring_day_of_week, status")
    .eq("student_id", studentId)
    .gte("start_time", studioNow().toISOString())
  if (futureError) return { error: futureError.message }

  const billingRate = rateParsed.rateCents ?? 0
  const slotsByDay = new Map(slotsParsed.slots.map((slot) => [slot.day_of_week, slot]))
  for (const booking of futureBookings || []) {
    if (booking.status === "cancelled") continue
    const slot = booking.is_recurring ? slotsByDay.get(booking.recurring_day_of_week ?? -1) : undefined
    const patch: { teacher_id?: string | null; rate_cents?: number | null; end_time?: string } = {}
    if (slot) {
      const newTeacher = slot.teacher_id ?? teacherId
      const newRate = slot.rate_cents ?? billingRate
      const newEnd = new Date(
        new Date(booking.start_time).getTime() + (slot.duration_minutes ?? duration) * 60000,
      ).toISOString()
      if (newTeacher !== booking.teacher_id) patch.teacher_id = newTeacher
      if (newRate !== booking.rate_cents) patch.rate_cents = newRate
      if (newEnd !== new Date(booking.end_time).toISOString()) patch.end_time = newEnd
    } else if (existing.teacher_id !== teacherId && booking.teacher_id === existing.teacher_id) {
      patch.teacher_id = teacherId
    }
    if (Object.keys(patch).length === 0) continue
    const { error: restampError } = await supabase.from("bookings").update(patch).eq("id", booking.id)
    if (restampError) return { error: restampError.message }
  }

  revalidateStudentViews()
  return { success: true }
}
