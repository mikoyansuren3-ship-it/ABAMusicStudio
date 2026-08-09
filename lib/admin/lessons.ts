import type { createClient } from "@/lib/supabase/server"
import type { Booking, StudentBilling, StudentSlot } from "@/lib/types"
import { toDateKey } from "@/lib/admin/format"
import { dateKeyUtc, wallClockToUtc } from "@/lib/studio-time"

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

interface GenerationStudent {
  id: string
  is_active: boolean
  teacher_id: string | null
  billing: StudentBilling | null
  slots: StudentSlot[]
}

/**
 * Materialize confirmed lessons for every active student's weekly slots in
 * [rangeStart, rangeEnd). Idempotent per student + local date: any existing
 * booking on that date — even a cancelled one — blocks regeneration, so admin
 * cancellations and reschedules stick. Attendance is never touched. Dates in
 * months before a slot existed are skipped (slot.created_at horizon; slots
 * migrated from the old single-slot billing inherit billing.created_at).
 * teacher_id is stamped from the student's CURRENT teacher at insert time —
 * a snapshot, so later reassignments don't rewrite history.
 *
 * Returns true when rows were inserted; callers should refetch their range.
 */
export async function ensureLessons(
  supabase: ServerSupabase,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<boolean> {
  const [studentsRes, bookingsRes] = await Promise.all([
    supabase
      .from("students")
      .select("id, is_active, teacher_id, billing:student_billing(*), slots:student_slots(*)")
      .eq("is_active", true),
    supabase
      .from("bookings")
      .select("student_id, start_time")
      .gte("start_time", wallClockToUtc(toDateKey(rangeStart), "00:00:00").toISOString())
      .lt("start_time", wallClockToUtc(toDateKey(rangeEnd), "00:00:00").toISOString()),
  ])

  const students: GenerationStudent[] = (studentsRes.data || []).map((student) => ({
    id: student.id,
    is_active: student.is_active,
    teacher_id: student.teacher_id ?? null,
    billing: Array.isArray(student.billing) ? (student.billing[0] ?? null) : (student.billing ?? null),
    slots: student.slots || [],
  }))

  const bookedDates = new Set(
    (bookingsRes.data || []).map((booking) => `${booking.student_id}|${dateKeyUtc(booking.start_time)}`),
  )

  const inserts: Array<Partial<Booking>> = []
  for (const student of students) {
    if (!student.billing || student.slots.length === 0) continue

    const slotsByDay = new Map(student.slots.map((slot) => [slot.day_of_week, slot]))

    for (const day = new Date(rangeStart); day < rangeEnd; day.setDate(day.getDate() + 1)) {
      const slot = slotsByDay.get(day.getDay())
      if (!slot) continue

      const slotStart = new Date(slot.created_at)
      const slotMonthStart = new Date(slotStart.getFullYear(), slotStart.getMonth(), 1)
      if (new Date(day.getFullYear(), day.getMonth(), 1) < slotMonthStart) continue

      if (bookedDates.has(`${student.id}|${toDateKey(day)}`)) continue

      const start = wallClockToUtc(toDateKey(day), slot.lesson_time)
      const end = new Date(start.getTime() + student.billing.duration_minutes * 60000)
      inserts.push({
        student_id: student.id,
        teacher_id: student.teacher_id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: "confirmed",
        is_recurring: true,
        recurring_day_of_week: slot.day_of_week,
      })
    }
  }

  if (inserts.length === 0) return false
  await supabase.from("bookings").insert(inserts)
  return true
}
