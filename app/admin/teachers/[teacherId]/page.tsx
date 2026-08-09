import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  TeacherDetailView,
  type RosterRow,
  type TeacherMonthActuals,
} from "@/components/admin/teacher-detail-view"
import type { PanelStudent } from "@/components/admin/student-panel"
import type { WeekBandDay } from "@/components/admin/week-bands"
import { ensureLessons } from "@/lib/admin/lessons"
import { periodActuals, weeklyPlanFromSlots } from "@/lib/admin/economics"
import { buildWeekSkeleton, resolveWeekAnchor, weekRangeLabel } from "@/lib/admin/week"
import { formatCurrencyCompact, formatTimeRange, toDateKey } from "@/lib/admin/format"
import { formatTime } from "@/lib/portal/format"
import { dateKeyUtc, minutesUtc, studioToday, wallClockToUtc } from "@/lib/studio-time"
import type { Availability, AvailabilityException, Booking, StudentSlot, Teacher } from "@/lib/types"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function minutesToTimeString(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`
}

export default async function TeacherDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ teacherId: string }>
  searchParams: Promise<{ week?: string }>
}) {
  const { teacherId } = await params
  const query = await searchParams
  if (!UUID_RE.test(teacherId)) notFound()

  const supabase = await createClient()

  const { data: teacher } = await supabase.from("teachers").select("*").eq("id", teacherId).maybeSingle()
  if (!teacher) notFound()

  const today = studioToday()
  const anchor = resolveWeekAnchor(query.week, today)
  const weekEndExclusive = new Date(anchor)
  weekEndExclusive.setDate(weekEndExclusive.getDate() + 7)
  const weekLast = new Date(anchor)
  weekLast.setDate(weekLast.getDate() + 6)

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  // Materialize both windows so the calendar and the month figures are fresh.
  await ensureLessons(supabase, anchor, weekEndExclusive)
  await ensureLessons(supabase, monthStart, monthEnd)

  const [studentsRes, teachersRes, weekBookingsRes, monthBookingsRes, availabilityRes, exceptionsRes] =
    await Promise.all([
      supabase
        .from("students")
        .select("*, profile:profiles(*), billing:student_billing(*), slots:student_slots(*)")
        .order("name"),
      supabase.from("teachers").select("*").order("sort_order").order("name"),
      supabase
        .from("bookings")
        .select("*, student:students(id, name)")
        .eq("teacher_id", teacherId)
        .eq("status", "confirmed")
        .gte("start_time", wallClockToUtc(toDateKey(anchor), "00:00:00").toISOString())
        .lt("start_time", wallClockToUtc(toDateKey(weekEndExclusive), "00:00:00").toISOString())
        .order("start_time"),
      supabase
        .from("bookings")
        .select("*")
        .eq("teacher_id", teacherId)
        .gte("start_time", wallClockToUtc(toDateKey(monthStart), "00:00:00").toISOString())
        .lt("start_time", wallClockToUtc(toDateKey(monthEnd), "00:00:00").toISOString()),
      supabase.from("availability").select("*").eq("is_active", true),
      supabase
        .from("availability_exceptions")
        .select("*")
        .gte("exception_date", toDateKey(anchor))
        .lte("exception_date", toDateKey(weekLast)),
    ])

  // Membership: any weekly slot taught by this teacher (slot teacher falls
  // back to the student's default), or the default alone when no slots exist.
  const slotsForThisTeacher = (student: { teacher_id: string | null; slots: StudentSlot[] }) =>
    student.slots.filter((slot) => (slot.teacher_id ?? student.teacher_id) === teacherId)

  const students: PanelStudent[] = (studentsRes.data || [])
    .map((student) => ({
      ...student,
      billing: Array.isArray(student.billing) ? (student.billing[0] ?? null) : (student.billing ?? null),
      slots: student.slots || [],
    }))
    .filter(
      (student) =>
        slotsForThisTeacher(student).length > 0 ||
        (student.slots.length === 0 && student.teacher_id === teacherId),
    )
  const teachers = (teachersRes.data || []) as Teacher[]
  const weekBookings = (weekBookingsRes.data || []) as (Booking & { student: { id: string; name: string } | null })[]
  const monthBookings = (monthBookingsRes.data || []) as Booking[]
  const availability = (availabilityRes.data || []) as Availability[]
  const exceptions = (exceptionsRes.data || []) as AvailabilityException[]

  const activeStudents = students.filter((student) => student.is_active)

  // Roster economics: planned weekly + this month's actual gross per student,
  // counting only this teacher's slots and this teacher's stamped lessons.
  const roster: RosterRow[] = activeStudents.map((student) => {
    const plan = student.billing
      ? weeklyPlanFromSlots(slotsForThisTeacher(student), student.billing, teacher.pay_hourly_cents)
      : { grossCents: 0, payCents: 0, profitCents: 0 }
    const studentMonthLessons = monthBookings.filter(
      (booking) => booking.student_id === student.id && booking.status !== "cancelled",
    )
    const monthGross = student.billing
      ? periodActuals(
          studentMonthLessons,
          student.billing.rate_cents,
          teacher.pay_hourly_cents,
          student.billing.duration_minutes,
        ).grossCents
      : 0
    return {
      studentId: student.id,
      weeklyGrossCents: plan.grossCents,
      weeklyPayCents: plan.payCents,
      monthGrossCents: monthGross,
      monthMissedCount: studentMonthLessons.filter(
        (lesson) => lesson.attendance === "missed" && !lesson.made_up_on,
      ).length,
    }
  })

  // Month actuals for this teacher (pay is duration-dependent, so per student).
  const monthActuals: TeacherMonthActuals = { grossCents: 0, payCents: 0, profitCents: 0, lessonCount: 0 }
  for (const student of students) {
    if (!student.billing) continue
    const lessons = monthBookings.filter(
      (booking) => booking.student_id === student.id && booking.status !== "cancelled",
    )
    if (lessons.length === 0) continue
    const actuals = periodActuals(
      lessons,
      student.billing.rate_cents,
      teacher.pay_hourly_cents,
      student.billing.duration_minutes,
    )
    monthActuals.grossCents += actuals.grossCents
    monthActuals.payCents += actuals.payCents
    monthActuals.profitCents += actuals.profitCents
    monthActuals.lessonCount += actuals.countedLessons
  }

  const skeleton = buildWeekSkeleton({ anchor, today, availability, exceptions })
  const weekDays: WeekBandDay[] = skeleton.days.map((day) => {
    const dayLessons = weekBookings.filter((booking) => dateKeyUtc(booking.start_time) === day.key)
    return {
      key: day.key,
      eyebrow: day.eyebrow,
      isToday: day.isToday,
      dateLabel: day.dateLabel,
      closed: day.closed,
      bandText: day.closed
        ? day.closedReason
          ? `Closed · ${day.closedReason}`
          : "Closed"
        : dayLessons.length === 0
          ? `No lessons for ${teacher.name}`
          : null,
      windowStart: day.windowStart,
      windowEnd: day.windowEnd,
      lessons: dayLessons.map((booking) => {
        const start = new Date(booking.start_time)
        const end = new Date(booking.end_time)
        const range = formatTimeRange(minutesToTimeString(minutesUtc(start)), minutesToTimeString(minutesUtc(end)))
        return {
          id: booking.id,
          label: `${booking.student?.name || "Student"} · ${range}`,
          title: `${booking.student?.name || "Student"}, ${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`,
          startMinutes: minutesUtc(start),
          durationMinutes: Math.max((end.getTime() - start.getTime()) / 60000, 15),
        }
      }),
    }
  })

  const weeklyLessonCount = activeStudents.reduce((sum, student) => sum + slotsForThisTeacher(student).length, 0)
  const weeklyPayTotal = roster.reduce((sum, row) => sum + row.weeklyPayCents, 0)
  const summary = `${weekRangeLabel(anchor, weekLast)} · ${activeStudents.length} ${
    activeStudents.length === 1 ? "student" : "students"
  } · ${weeklyLessonCount} ${weeklyLessonCount === 1 ? "lesson" : "lessons"} a week · ${formatCurrencyCompact(weeklyPayTotal)}/wk planned pay`

  const prevAnchor = new Date(anchor)
  prevAnchor.setDate(prevAnchor.getDate() - 7)
  const nextAnchor = new Date(anchor)
  nextAnchor.setDate(nextAnchor.getDate() + 7)
  const base = `/admin/teachers/${teacherId}`

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <TeacherDetailView
        teacher={teacher as Teacher}
        teachers={teachers}
        students={students}
        roster={roster}
        weekDays={weekDays}
        hourLabels={skeleton.hourLabels}
        scaleStart={skeleton.scaleStart}
        scaleEnd={skeleton.scaleEnd}
        summary={summary}
        hrefs={{
          prev: `${base}?week=${toDateKey(prevAnchor)}`,
          current: base,
          next: `${base}?week=${toDateKey(nextAnchor)}`,
        }}
        monthName={today.toLocaleDateString("en-US", { month: "long" })}
        monthActuals={monthActuals}
      />
    </div>
  )
}
