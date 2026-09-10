import { ChevronLeft, ChevronRight } from "lucide-react"
import { AdminCard, EmptyState, Eyebrow, NavSquareLink, PageHeader } from "@/components/admin/ui"
import { AttendanceControls } from "@/components/teacher/attendance-controls"
import { TeacherWeekCalendar } from "@/components/teacher/week-calendar"
import { UnlinkedNotice } from "@/components/teacher/unlinked-notice"
import { getTeacherContext } from "@/lib/teacher/context"
import { loadTeacherWeek, unmarkedLessons } from "@/lib/teacher/week"
import { formatTimeRange, minutesToTimeString, toDateKey } from "@/lib/admin/format"
import { resolveWeekAnchor, weekRangeLabel } from "@/lib/admin/week"
import { dateKeyUtc, minutesUtc, studioNow, studioToday } from "@/lib/studio-time"

export const metadata = {
  title: "Schedule",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function TeacherSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { supabase, teacher } = await getTeacherContext()
  if (!teacher) return <UnlinkedNotice />

  const query = await searchParams
  const today = studioToday()
  const now = studioNow()
  const anchor = resolveWeekAnchor(query.week, today)

  const week = await loadTeacherWeek({
    supabase,
    teacherId: teacher.id,
    anchor,
    today,
    teacherName: teacher.name,
  })

  const toMark = unmarkedLessons(week.lessons, now)
  const came = week.lessons.filter((lesson) => lesson.attendance === "on_time").length
  const missed = week.lessons.filter((lesson) => lesson.attendance === "missed").length

  const prevAnchor = new Date(anchor)
  prevAnchor.setDate(prevAnchor.getDate() - 7)
  const nextAnchor = new Date(anchor)
  nextAnchor.setDate(nextAnchor.getDate() + 7)

  const summary = `${weekRangeLabel(anchor, week.weekLast)} · ${week.lessons.length} ${
    week.lessons.length === 1 ? "lesson" : "lessons"
  } · ${came} came · ${missed} no-show${toMark.length > 0 ? ` · ${toMark.length} to mark` : ""}`

  // Day groups for the list under the calendar, in calendar order.
  const dayGroups = week.days.map((day) => ({
    key: day.key,
    heading: `${day.eyebrow.replace(/^Today · /, "Today, ")} ${day.dateLabel}`,
    isToday: day.isToday,
    lessons: week.lessons.filter((lesson) => dateKeyUtc(lesson.start_time) === day.key),
  }))

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <PageHeader
        title="Your week"
        summary={summary}
        actions={
          <div className="flex items-center gap-2">
            <NavSquareLink href={`/dashboard/schedule?week=${toDateKey(prevAnchor)}`} ariaLabel="Previous week">
              <ChevronLeft className="size-[18px]" aria-hidden />
            </NavSquareLink>
            <NavSquareLink href={`/dashboard/schedule?week=${toDateKey(nextAnchor)}`} ariaLabel="Next week">
              <ChevronRight className="size-[18px]" aria-hidden />
            </NavSquareLink>
          </div>
        }
      />

      <TeacherWeekCalendar
        eyebrow={weekRangeLabel(anchor, week.weekLast)}
        days={week.days}
        hourLabels={week.hourLabels}
        scaleStart={week.scaleStart}
        scaleEnd={week.scaleEnd}
      />

      <AdminCard className="flex flex-col gap-[18px] pb-[26px]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">Lesson by lesson</h2>
          <span className="text-xs text-muted-foreground">Marks show on the calendar above</span>
        </div>

        {week.lessons.length === 0 ? (
          <EmptyState title="No lessons this week">
            Nothing is on your calendar for {weekRangeLabel(anchor, week.weekLast)}. Weekly lessons are set by the
            studio — an administrator adds or moves them from the admin schedule.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-6">
            {dayGroups
              .filter((group) => group.lessons.length > 0)
              .map((group) => (
                <div key={group.key} className="flex flex-col gap-1">
                  <Eyebrow className={group.isToday ? "" : "text-muted-foreground"}>{group.heading}</Eyebrow>
                  <ul className="flex flex-col">
                    {group.lessons.map((lesson, index) => {
                      const start = new Date(lesson.start_time)
                      const end = new Date(lesson.end_time)
                      const range = formatTimeRange(
                        minutesToTimeString(minutesUtc(start)),
                        minutesToTimeString(minutesUtc(end)),
                      )
                      return (
                        <li
                          key={lesson.id}
                          className={`flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between ${
                            index === group.lessons.length - 1 ? "" : "border-b"
                          }`}
                        >
                          <span className="flex min-w-0 flex-col gap-[3px]">
                            <span className="truncate text-[15px] font-semibold">
                              {lesson.student?.name || "Student"}
                            </span>
                            <span className="truncate text-[13px] text-muted-foreground">{range}</span>
                          </span>
                          <AttendanceControls
                            bookingId={lesson.id}
                            studentName={lesson.student?.name || "This student"}
                            attendance={lesson.attendance}
                            size="sm"
                            className="shrink-0"
                          />
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </AdminCard>
    </div>
  )
}
