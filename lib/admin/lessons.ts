import type { createClient } from "@/lib/supabase/server"
import type { Booking, StudentBilling, StudentSlot } from "@/lib/types"
import { toDateKey } from "@/lib/admin/format"
import { dateKeyUtc, studioNow, toStudioWallClock, wallClockToUtc } from "@/lib/studio-time"

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

/** "2026-09-09" → the date key of the Sunday that starts its week. */
export function weekKeyOf(dateKey: string) {
  const sunday = new Date(`${dateKey}T00:00:00Z`)
  sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay())
  return sunday.toISOString().slice(0, 10)
}

export interface ReconcileStudent {
  is_active: boolean
  teacher_id: string | null
  billing: Pick<StudentBilling, "rate_cents" | "duration_minutes"> | null
  slots: Pick<StudentSlot, "day_of_week" | "lesson_time" | "teacher_id" | "duration_minutes" | "rate_cents">[]
}

export interface ReconcileBooking {
  start_time: string
  end_time: string
  status: Booking["status"]
  is_recurring: boolean | null
  recurring_day_of_week: number | null
  teacher_id: string | null
  rate_cents: number | null
  attendance: Booking["attendance"]
}

export interface LessonPatch {
  teacher_id?: string | null
  rate_cents?: number | null
  start_time?: string
  end_time?: string
}

export type LessonReconcile = { action: "delete" } | { action: "patch"; patch: LessonPatch } | null

/**
 * What an UPCOMING weekly lesson needs so it matches its student's current
 * slots. The roster is the source of truth:
 *
 * - inactive student → the generated lesson goes away;
 * - weekday dropped → a confirmed lesson still on that weekday goes away;
 * - otherwise a confirmed lesson still on its slot's weekday moves to the
 *   slot's time and length, and every weekly lesson picks up the slot's
 *   teacher and rate.
 *
 * Lessons the family moved are detached (`is_recurring` false, see
 * updateBookingStatus) and never touched. Pending requests keep their time.
 * Attendance-marked, cancelled, and completed lessons are never touched.
 * Callers decide what "upcoming" means — pass only future lessons.
 */
export function planLessonReconcile(booking: ReconcileBooking, student: ReconcileStudent): LessonReconcile {
  if (!booking.is_recurring || booking.recurring_day_of_week === null) return null
  if (booking.attendance || booking.status === "cancelled" || booking.status === "completed") return null
  if (!student.is_active) return { action: "delete" }

  const day = booking.recurring_day_of_week
  const start = new Date(booking.start_time)
  const onSchedule = booking.status === "confirmed" && start.getUTCDay() === day
  const slot = student.slots.find((candidate) => candidate.day_of_week === day)
  if (!slot) return onSchedule ? { action: "delete" } : null

  const patch: LessonPatch = {}
  const newTeacher = slot.teacher_id ?? student.teacher_id
  const newRate = slot.rate_cents ?? student.billing?.rate_cents ?? null
  if (newTeacher !== booking.teacher_id) patch.teacher_id = newTeacher
  if (newRate !== booking.rate_cents) patch.rate_cents = newRate

  const currentMinutes = Math.round((new Date(booking.end_time).getTime() - start.getTime()) / 60000)
  const durationMinutes = slot.duration_minutes ?? student.billing?.duration_minutes ?? currentMinutes
  const newStart = onSchedule ? wallClockToUtc(dateKeyUtc(start), slot.lesson_time) : start
  const newEnd = new Date(newStart.getTime() + durationMinutes * 60000)
  if (newStart.getTime() !== start.getTime()) patch.start_time = newStart.toISOString()
  if (newEnd.getTime() !== new Date(booking.end_time).getTime()) patch.end_time = newEnd.toISOString()

  return Object.keys(patch).length > 0 ? { action: "patch", patch } : null
}

interface GenerationStudent extends ReconcileStudent {
  id: string
  billing: StudentBilling | null
  slots: StudentSlot[]
}

type WindowBooking = ReconcileBooking & { id: string; student_id: string }

/**
 * Keep the schedule in step with the roster for [rangeStart, rangeEnd):
 *
 * 1. Reconcile upcoming weekly lessons in the window with their student's
 *    current slots (see planLessonReconcile) — so slot edits, dropped days,
 *    and deactivated students are reflected without any manual re-save.
 * 2. Materialize confirmed lessons for every active student's weekly slots.
 *    Idempotent per student + week + weekday slot: any existing booking on a
 *    date — even a cancelled one — blocks a new lesson on that date, so
 *    admin cancellations stick; and a lesson that carries a slot weekday
 *    still counts for the week it lives in even after the family moved it,
 *    so the original day isn't regenerated alongside the moved lesson.
 *
 * Attendance is never touched. Dates in months before a slot existed are
 * skipped (slot.created_at horizon, read in studio time). teacher_id and
 * rate_cents are stamped at insert time from the SLOT (falling back to the
 * student's default teacher and standing rate) — snapshots, so later
 * reassignments or rate changes don't rewrite past months.
 *
 * Returns true when anything changed; callers should refetch their range.
 */
export async function ensureLessons(
  supabase: ServerSupabase,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<boolean> {
  // Read whole weeks around the range so a lesson moved elsewhere in the
  // week is visible even when the range starts or ends mid-week.
  const fetchStart = new Date(rangeStart)
  fetchStart.setDate(fetchStart.getDate() - fetchStart.getDay())
  const fetchEnd = new Date(rangeEnd)
  fetchEnd.setDate(fetchEnd.getDate() + (7 - fetchEnd.getDay()))

  const [studentsRes, bookingsRes] = await Promise.all([
    supabase
      .from("students")
      .select("id, is_active, teacher_id, billing:student_billing(*), slots:student_slots(*)"),
    supabase
      .from("bookings")
      .select(
        "id, student_id, start_time, end_time, status, is_recurring, recurring_day_of_week, teacher_id, rate_cents, attendance",
      )
      .gte("start_time", wallClockToUtc(toDateKey(fetchStart), "00:00:00").toISOString())
      .lt("start_time", wallClockToUtc(toDateKey(fetchEnd), "00:00:00").toISOString()),
  ])

  if (studentsRes.error || bookingsRes.error) {
    console.error("ensureLessons read failed:", studentsRes.error ?? bookingsRes.error)
    return false
  }

  const students: GenerationStudent[] = (studentsRes.data || []).map((student) => ({
    id: student.id,
    is_active: student.is_active,
    teacher_id: student.teacher_id ?? null,
    billing: Array.isArray(student.billing) ? (student.billing[0] ?? null) : (student.billing ?? null),
    slots: student.slots || [],
  }))
  const studentsById = new Map(students.map((student) => [student.id, student]))

  let changed = false

  // ── 1. Reconcile upcoming lessons with current slots ────────────────────
  const nowMs = studioNow().getTime()
  let bookings = (bookingsRes.data || []) as WindowBooking[]
  const deletes = new Set<string>()
  for (const booking of bookings) {
    if (new Date(booking.start_time).getTime() < nowMs) continue
    const student = studentsById.get(booking.student_id)
    if (!student) continue
    const plan = planLessonReconcile(booking, student)
    if (!plan) continue
    if (plan.action === "delete") {
      deletes.add(booking.id)
      continue
    }
    const { error } = await supabase.from("bookings").update(plan.patch).eq("id", booking.id)
    if (error) {
      console.error("ensureLessons reconcile failed:", error)
      continue
    }
    Object.assign(booking, plan.patch)
    changed = true
  }
  if (deletes.size > 0) {
    const { error } = await supabase.from("bookings").delete().in("id", [...deletes])
    if (error) {
      console.error("ensureLessons prune failed:", error)
    } else {
      bookings = bookings.filter((booking) => !deletes.has(booking.id))
      changed = true
    }
  }

  // ── 2. Materialize missing weekly lessons ────────────────────────────────
  const bookedDates = new Set<string>()
  const bookedWeekSlots = new Set<string>()
  for (const booking of bookings) {
    const dateKey = dateKeyUtc(booking.start_time)
    bookedDates.add(`${booking.student_id}|${dateKey}`)
    if (booking.recurring_day_of_week !== null) {
      bookedWeekSlots.add(`${booking.student_id}|${weekKeyOf(dateKey)}|${booking.recurring_day_of_week}`)
    }
  }

  const inserts: Array<Partial<Booking>> = []
  for (const student of students) {
    if (!student.is_active || !student.billing || student.slots.length === 0) continue

    const slotsByDay = new Map(student.slots.map((slot) => [slot.day_of_week, slot]))

    for (const day = new Date(rangeStart); day < rangeEnd; day.setDate(day.getDate() + 1)) {
      const slot = slotsByDay.get(day.getDay())
      if (!slot) continue

      // created_at is a real instant; compare months in studio time so a
      // slot added late on the last evening of a month still covers it.
      const created = toStudioWallClock(new Date(slot.created_at))
      const horizonMonth = created.getUTCFullYear() * 12 + created.getUTCMonth()
      if (day.getFullYear() * 12 + day.getMonth() < horizonMonth) continue

      const dateKey = toDateKey(day)
      const weekSlotKey = `${student.id}|${weekKeyOf(dateKey)}|${slot.day_of_week}`
      if (bookedDates.has(`${student.id}|${dateKey}`)) continue
      if (bookedWeekSlots.has(weekSlotKey)) continue

      const start = wallClockToUtc(dateKey, slot.lesson_time)
      const durationMinutes = slot.duration_minutes ?? student.billing.duration_minutes
      const end = new Date(start.getTime() + durationMinutes * 60000)
      inserts.push({
        student_id: student.id,
        // Slot overrides first — a multi-teacher student's Monday piano and
        // Thursday vocal stamp different teachers and rates.
        teacher_id: slot.teacher_id ?? student.teacher_id,
        rate_cents: slot.rate_cents ?? student.billing.rate_cents,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: "confirmed",
        is_recurring: true,
        recurring_day_of_week: slot.day_of_week,
      })
      bookedDates.add(`${student.id}|${dateKey}`)
      bookedWeekSlots.add(weekSlotKey)
    }
  }

  if (inserts.length === 0) return changed
  const { error } = await supabase.from("bookings").insert(inserts)
  if (error) {
    console.error("ensureLessons insert failed:", error)
    return changed
  }
  return true
}
