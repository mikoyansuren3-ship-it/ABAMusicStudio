import { createClient } from "@/lib/supabase/server"
import { TeachersView, type MonthTotals, type TeacherSummaryRow } from "@/components/admin/teachers-view"
import { ensureLessons } from "@/lib/admin/lessons"
import { periodActuals, weeklyPlanFromSlots } from "@/lib/admin/economics"
import { studioToday, wallClockToUtc } from "@/lib/studio-time"
import { toDateKey } from "@/lib/admin/format"
import type { Booking, StudentBilling, StudentSlot, Teacher } from "@/lib/types"

interface StudentLite {
  id: string
  teacher_id: string | null
  is_active: boolean
  billing: StudentBilling | null
  slots: StudentSlot[]
}

export default async function AdminTeachersPage() {
  const supabase = await createClient()

  const now = studioToday()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  // Calendars are made automatically: materialize this month before reading.
  await ensureLessons(supabase, monthStart, monthEnd)

  const [teachersRes, studentsRes, bookingsRes] = await Promise.all([
    supabase.from("teachers").select("*").order("sort_order").order("name"),
    supabase
      .from("students")
      .select("id, teacher_id, is_active, billing:student_billing(*), slots:student_slots(*)"),
    supabase
      .from("bookings")
      .select("*")
      .gte("start_time", wallClockToUtc(toDateKey(monthStart), "00:00:00").toISOString())
      .lt("start_time", wallClockToUtc(toDateKey(monthEnd), "00:00:00").toISOString()),
  ])

  const teachers = (teachersRes.data || []) as Teacher[]
  const students: StudentLite[] = (studentsRes.data || []).map((student) => ({
    id: student.id,
    teacher_id: student.teacher_id ?? null,
    is_active: student.is_active,
    billing: Array.isArray(student.billing) ? (student.billing[0] ?? null) : (student.billing ?? null),
    slots: student.slots || [],
  }))
  const monthBookings = (bookingsRes.data || []) as Booking[]

  // A student belongs to a teacher through any weekly slot taught by them
  // (slot teacher, falling back to the student's default) — or through the
  // default alone when no slots are set yet. Multi-teacher students appear
  // on every teacher they study with.
  const slotsForTeacher = (student: StudentLite, teacherId: string) =>
    student.slots.filter((slot) => (slot.teacher_id ?? student.teacher_id) === teacherId)

  const rows: TeacherSummaryRow[] = teachers.map((teacher) => {
    const assigned = students.filter(
      (student) =>
        student.is_active &&
        (slotsForTeacher(student, teacher.id).length > 0 ||
          (student.slots.length === 0 && student.teacher_id === teacher.id)),
    )
    let weeklyGrossCents = 0
    let weeklyPayCents = 0
    for (const student of assigned) {
      if (!student.billing) continue
      const slots = slotsForTeacher(student, teacher.id)
      if (slots.length === 0) continue
      const plan = weeklyPlanFromSlots(slots, student.billing, teacher.pay_hourly_cents)
      weeklyGrossCents += plan.grossCents
      weeklyPayCents += plan.payCents
    }
    return {
      teacher,
      studentCount: assigned.length,
      weeklyGrossCents,
      weeklyPayCents,
      weeklyProfitCents: weeklyGrossCents - weeklyPayCents,
    }
  })

  // Month actuals across everyone, grouped by each lesson's snapshot teacher.
  const monthTotals: MonthTotals = { grossCents: 0, payCents: 0, profitCents: 0, lessonCount: 0 }
  for (const student of students) {
    if (!student.billing) continue
    const lessonsByTeacher = new Map<string | null, Booking[]>()
    for (const booking of monthBookings) {
      if (booking.student_id !== student.id || booking.status === "cancelled") continue
      const key = booking.teacher_id ?? null
      lessonsByTeacher.set(key, [...(lessonsByTeacher.get(key) ?? []), booking])
    }
    for (const [teacherId, lessons] of lessonsByTeacher) {
      const teacher = teacherId ? teachers.find((t) => t.id === teacherId) : undefined
      const actuals = periodActuals(
        lessons,
        student.billing.rate_cents,
        teacher?.pay_hourly_cents ?? 0,
        student.billing.duration_minutes,
      )
      monthTotals.grossCents += actuals.grossCents
      monthTotals.payCents += actuals.payCents
      monthTotals.profitCents += actuals.profitCents
      monthTotals.lessonCount += actuals.countedLessons
    }
  }

  const monthName = now.toLocaleDateString("en-US", { month: "long" })

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <TeachersView rows={rows} monthTotals={monthTotals} monthName={monthName} />
    </div>
  )
}
