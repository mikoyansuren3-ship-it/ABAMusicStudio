import { createClient } from "@/lib/supabase/server"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { AdminCard, Eyebrow, NavSquareLink, PageHeader, PillTabs } from "@/components/admin/ui"
import { AddLessonButton } from "@/components/admin/add-lesson-dialog"
import { RescheduleRequests } from "@/components/admin/reschedule-requests"
import { WeekBands, type WeekBandDay } from "@/components/admin/week-bands"
import { ensureLessons } from "@/lib/admin/lessons"
import { buildWeekSkeleton, resolveWeekAnchor, weekRangeLabel } from "@/lib/admin/week"
import { formatTimeRange, numberWord, toDateKey } from "@/lib/admin/format"
import { formatTime } from "@/lib/portal/format"
import type { Availability, AvailabilityException, Booking, Profile, Student, Teacher } from "@/lib/types"

type BookingRow = Booking & { student: (Student & { profile: Profile | null }) | null }

function minutesToTimeString(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`
}

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; teacher?: string }>
}) {
  const params = await searchParams
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const anchor = resolveWeekAnchor(params.week, today)
  const weekEndExclusive = new Date(anchor)
  weekEndExclusive.setDate(weekEndExclusive.getDate() + 7)
  const weekLast = new Date(anchor)
  weekLast.setDate(weekLast.getDate() + 6)

  const supabase = await createClient()

  // Materialize this week's lessons from weekly slots before reading.
  await ensureLessons(supabase, anchor, weekEndExclusive)

  const [bookingsRes, pendingRes, studentsRes, availabilityRes, exceptionsRes, teachersRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, student:students(*, profile:profiles(*))")
      .gte("start_time", anchor.toISOString())
      .lt("start_time", weekEndExclusive.toISOString())
      .eq("status", "confirmed")
      .order("start_time"),
    supabase
      .from("bookings")
      .select("*, student:students(*, profile:profiles(*))")
      .gte("start_time", today.toISOString())
      .eq("status", "pending")
      .order("start_time"),
    supabase.from("students").select("*, profile:profiles(*)").eq("is_active", true).order("created_at"),
    supabase.from("availability").select("*").eq("is_active", true),
    supabase
      .from("availability_exceptions")
      .select("*")
      .gte("exception_date", toDateKey(anchor))
      .lte("exception_date", toDateKey(weekLast)),
    supabase.from("teachers").select("*").order("sort_order").order("name"),
  ])

  const allBookings = (bookingsRes.data || []) as BookingRow[]
  const pendingRequests = (pendingRes.data || []) as BookingRow[]
  const students = studentsRes.data || []
  const availability = (availabilityRes.data || []) as Availability[]
  const exceptions = (exceptionsRes.data || []) as AvailabilityException[]
  const teachers = (teachersRes.data || []) as Teacher[]

  // Teacher filter (?teacher=<id|unassigned>), reflected in every nav link.
  const activeTeachers = teachers.filter((teacher) => teacher.is_active)
  const hasUnassigned = allBookings.some((booking) => booking.teacher_id === null)
  const teacherParam = params.teacher
  const teacherFilter =
    teacherParam === "unassigned"
      ? "unassigned"
      : teachers.some((teacher) => teacher.id === teacherParam)
        ? teacherParam!
        : null

  const bookings =
    teacherFilter === null
      ? allBookings
      : allBookings.filter((booking) =>
          teacherFilter === "unassigned" ? booking.teacher_id === null : booking.teacher_id === teacherFilter,
        )

  const weekHref = (weekKey: string | null, teacher: string | null) => {
    const query = new URLSearchParams()
    if (weekKey) query.set("week", weekKey)
    if (teacher) query.set("teacher", teacher)
    const qs = query.toString()
    return `/admin/schedule${qs ? `?${qs}` : ""}`
  }

  const skeleton = buildWeekSkeleton({ anchor, today, availability, exceptions })
  const days: WeekBandDay[] = skeleton.days.map((day) => {
    const dayLessons = bookings.filter((booking) => toDateKey(new Date(booking.start_time)) === day.key)

    let bandText: string | null = null
    if (day.closed) {
      bandText = day.closedReason ? `Closed · ${day.closedReason}` : "Closed"
    } else if (dayLessons.length === 0) {
      const openHours = (day.windowEnd - day.windowStart) / 60
      bandText = day.isToday
        ? `Open all ${numberWord(openHours)} ${openHours === 1 ? "hour" : "hours"} — nothing booked`
        : `${formatTimeRange(minutesToTimeString(day.windowStart), minutesToTimeString(day.windowEnd))} open`
    }

    return {
      key: day.key,
      eyebrow: day.eyebrow,
      isToday: day.isToday,
      dateLabel: day.dateLabel,
      closed: day.closed,
      bandText,
      windowStart: day.windowStart,
      windowEnd: day.windowEnd,
      lessons: dayLessons.map((booking) => {
        const start = new Date(booking.start_time)
        const end = new Date(booking.end_time)
        return {
          id: booking.id,
          label: `${booking.student?.name || "Student"} · ${formatTime(booking.start_time)}`,
          title: `${booking.student?.name || "Student"}, ${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`,
          startMinutes: start.getHours() * 60 + start.getMinutes(),
          durationMinutes: Math.max((end.getTime() - start.getTime()) / 60000, 15),
        }
      }),
    }
  })

  const lessonCount = bookings.length
  const filterSuffix =
    teacherFilter === "unassigned"
      ? " without a teacher"
      : teacherFilter
        ? ` for ${teachers.find((teacher) => teacher.id === teacherFilter)?.name}`
        : ""
  const summary = `${weekRangeLabel(anchor, weekLast)} · ${
    lessonCount === 0
      ? `no lessons${filterSuffix} booked this week`
      : `${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}${filterSuffix} this week`
  }`

  const prevAnchor = new Date(anchor)
  prevAnchor.setDate(prevAnchor.getDate() - 7)
  const nextAnchor = new Date(anchor)
  nextAnchor.setDate(nextAnchor.getDate() + 7)

  const studentOptions = students.map((student) => ({
    id: student.id,
    name: student.name,
    guardian: student.profile?.full_name || student.contact_name || null,
  }))

  const anchorKey = params.week ?? null

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <PageHeader
        title="Schedule"
        summary={summary}
        actions={
          <>
            <div className="flex items-center gap-2">
              <NavSquareLink href={weekHref(toDateKey(prevAnchor), teacherFilter)} ariaLabel="Previous week">
                <ChevronLeft className="size-4" aria-hidden />
              </NavSquareLink>
              <Link
                href={weekHref(null, teacherFilter)}
                className="inline-flex h-[38px] items-center rounded-lg border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted/50"
              >
                This week
              </Link>
              <NavSquareLink href={weekHref(toDateKey(nextAnchor), teacherFilter)} ariaLabel="Next week">
                <ChevronRight className="size-4" aria-hidden />
              </NavSquareLink>
            </div>
            <AddLessonButton students={studentOptions} availability={availability} />
          </>
        }
      />

      {(activeTeachers.length > 0 || teacherFilter !== null) && (
        <PillTabs
          tabs={[
            { href: weekHref(anchorKey, null), label: "Everyone", active: teacherFilter === null },
            ...activeTeachers.map((teacher) => ({
              href: weekHref(anchorKey, teacher.id),
              label: teacher.name,
              active: teacherFilter === teacher.id,
            })),
            ...(hasUnassigned || teacherFilter === "unassigned"
              ? [
                  {
                    href: weekHref(anchorKey, "unassigned"),
                    label: "Unassigned",
                    active: teacherFilter === "unassigned",
                  },
                ]
              : []),
          ]}
        />
      )}

      <WeekBands eyebrow="This week" hourLabels={skeleton.hourLabels} days={days} />

      <AdminCard className="flex flex-col gap-2.5">
        <Eyebrow>Reschedule requests</Eyebrow>
        <RescheduleRequests requests={pendingRequests} />
      </AdminCard>
    </div>
  )
}
