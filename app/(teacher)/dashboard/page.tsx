import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AdminCard, Eyebrow, EmptyState, PageHeader } from "@/components/admin/ui"
import { AttendanceControls } from "@/components/teacher/attendance-controls"
import { TeacherWeekCalendar } from "@/components/teacher/week-calendar"
import { UnlinkedNotice } from "@/components/teacher/unlinked-notice"
import { getTeacherContext } from "@/lib/teacher/context"
import { loadTeacherWeek, unmarkedLessons } from "@/lib/teacher/week"
import { greetingForHour, minutesToTimeString, formatTimeRange, toDateKey } from "@/lib/admin/format"
import { dateKeyUtc, minutesUtc, studioNow, studioToday } from "@/lib/studio-time"

export const metadata = {
  title: "Teacher Dashboard",
  robots: { index: false, follow: false },
}

// Authenticated, per-request data — never prerendered at build time.
export const dynamic = "force-dynamic"

export default async function TeacherTodayPage() {
  const { supabase, profile, teacher } = await getTeacherContext()
  if (!teacher) return <UnlinkedNotice />

  const now = studioNow()
  const today = studioToday()
  const todayKey = toDateKey(today)

  // The calendar below is this week; "this week" starts today so the band the
  // teacher scans first is the one they are standing in.
  const week = await loadTeacherWeek({
    supabase,
    teacherId: teacher.id,
    anchor: today,
    today,
    teacherName: teacher.name,
  })

  const todaysLessons = week.lessons.filter((lesson) => dateKeyUtc(lesson.start_time) === todayKey)
  const toMark = unmarkedLessons(week.lessons, now)
  const cameToday = todaysLessons.filter((lesson) => lesson.attendance === "on_time").length
  const missedToday = todaysLessons.filter((lesson) => lesson.attendance === "missed").length

  const greeting = `${greetingForHour(now.getUTCHours())}, ${(profile.full_name || teacher.name).split(" ")[0]}`
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const summary = `${dateLabel} · ${
    todaysLessons.length === 0
      ? "no lessons on your calendar today"
      : `${todaysLessons.length} ${todaysLessons.length === 1 ? "lesson" : "lessons"} today`
  }${toMark.length > 0 ? ` · ${toMark.length} to mark` : ""}`

  const stats = [
    {
      key: "today",
      label: "Today's lessons",
      value: String(todaysLessons.length),
      footnote:
        todaysLessons.length === 0
          ? "Nothing scheduled"
          : `${cameToday} came · ${missedToday} no-show · ${todaysLessons.length - cameToday - missedToday} unmarked`,
    },
    {
      key: "tomark",
      label: "Waiting on you",
      value: String(toMark.length),
      footnote: toMark.length === 0 ? "All caught up" : "Lessons that have finished without a mark",
    },
    {
      key: "week",
      label: "Lessons this week",
      value: String(week.lessons.length),
      footnote: `${teacher.instrument ? `${teacher.instrument} · ` : ""}next seven days`,
    },
  ]

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <PageHeader
        title={greeting}
        summary={summary}
        actions={
          <Link
            href="/dashboard/schedule"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-card px-3.5 text-[13px] font-semibold transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
          >
            Full schedule
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        }
      />

      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <AdminCard key={stat.key} className="flex flex-col gap-2">
            <Eyebrow>{stat.label}</Eyebrow>
            <p className="font-serif text-[34px] font-bold leading-none">{stat.value}</p>
            <p className="text-[13px] text-muted-foreground">{stat.footnote}</p>
          </AdminCard>
        ))}
      </div>

      <AdminCard className="flex flex-col gap-[18px] pb-[26px]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">Today&apos;s lessons</h2>
          <span className="text-xs text-muted-foreground">Mark each one after class</span>
        </div>

        {todaysLessons.length === 0 ? (
          <EmptyState title="Nothing on today">
            No lessons are on your calendar for {dateLabel}. Your week is on the calendar below.
          </EmptyState>
        ) : (
          <ul className="flex flex-col">
            {todaysLessons.map((lesson, index) => {
              const start = new Date(lesson.start_time)
              const end = new Date(lesson.end_time)
              const range = formatTimeRange(
                minutesToTimeString(minutesUtc(start)),
                minutesToTimeString(minutesUtc(end)),
              )
              const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
              return (
                <li
                  key={lesson.id}
                  className={`flex flex-col gap-4 py-[18px] sm:flex-row sm:items-center sm:justify-between ${
                    index === todaysLessons.length - 1 ? "" : "border-b"
                  }`}
                >
                  <span className="flex min-w-0 flex-col gap-[3px]">
                    <span className="truncate font-serif text-[19px] font-semibold">
                      {lesson.student?.name || "Student"}
                    </span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {range} · {durationMinutes} minutes
                    </span>
                  </span>
                  <AttendanceControls
                    bookingId={lesson.id}
                    studentName={lesson.student?.name || "This student"}
                    attendance={lesson.attendance}
                    className="shrink-0"
                  />
                </li>
              )
            })}
          </ul>
        )}
      </AdminCard>

      <TeacherWeekCalendar
        eyebrow="This week"
        days={week.days}
        hourLabels={week.hourLabels}
        scaleStart={week.scaleStart}
        scaleEnd={week.scaleEnd}
      />
    </div>
  )
}
