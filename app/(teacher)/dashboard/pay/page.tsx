import { ChevronLeft, ChevronRight } from "lucide-react"
import { AdminCard, EmptyState, Eyebrow, NavSquareLink, PageHeader } from "@/components/admin/ui"
import { UnlinkedNotice } from "@/components/teacher/unlinked-notice"
import { getTeacherContext } from "@/lib/teacher/context"
import type { TeacherLesson } from "@/lib/teacher/week"
import { lessonCounts, payPerLessonCents } from "@/lib/admin/economics"
import { formatTimeRange, hoursLabel, minutesToTimeString, toDateKey } from "@/lib/admin/format"
import { formatCurrency, formatShortDate } from "@/lib/portal/format"
import { minutesUtc, studioNow, studioToday, wallClockToUtc } from "@/lib/studio-time"

export const metadata = {
  title: "Your pay",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

/** `?month=YYYY-MM`, else the current studio month. */
function resolveMonth(monthParam: string | undefined, today: Date) {
  const match = monthParam?.match(/^(\d{4})-(\d{2})$/)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12) {
      return { year, month }
    }
  }
  return { year: today.getFullYear(), month: today.getMonth() + 1 }
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

function shiftMonth(year: number, month: number, delta: number) {
  const shifted = new Date(year, month - 1 + delta, 1)
  return monthKey(shifted.getFullYear(), shifted.getMonth() + 1)
}

function lessonMinutes(lesson: TeacherLesson) {
  const minutes = (new Date(lesson.end_time).getTime() - new Date(lesson.start_time).getTime()) / 60000
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 0
}

export default async function TeacherPayPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { supabase, teacher } = await getTeacherContext()
  if (!teacher) return <UnlinkedNotice />

  const query = await searchParams
  const today = studioToday()
  const now = studioNow()
  const { year, month } = resolveMonth(query.month, today)
  const rangeStart = new Date(year, month - 1, 1)
  const rangeEnd = new Date(year, month, 1)
  const anchor = monthKey(year, month)
  const monthName = rangeStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const { data } = await supabase
    .from("bookings")
    .select("*, student:students(id, name)")
    .eq("teacher_id", teacher.id)
    .gte("start_time", wallClockToUtc(toDateKey(rangeStart), "00:00:00").toISOString())
    .lt("start_time", wallClockToUtc(toDateKey(rangeEnd), "00:00:00").toISOString())
    .order("start_time")

  const lessons = (data || []) as TeacherLesson[]
  const hourlyCents = teacher.pay_hourly_cents

  // "Hours you did" is lessons that have already happened and still count —
  // the ledger's rule, so this never disagrees with the studio's pay report:
  // a lesson missed with no make-up recorded pays nothing.
  const taught = lessons.filter((lesson) => new Date(lesson.start_time) <= now && lessonCounts(lesson))
  const unpaid = lessons.filter((lesson) => new Date(lesson.start_time) <= now && !lessonCounts(lesson))
  const upcoming = lessons.filter((lesson) => new Date(lesson.start_time) > now && lesson.status !== "cancelled")

  const sumMinutes = (rows: TeacherLesson[]) => rows.reduce((total, lesson) => total + lessonMinutes(lesson), 0)
  const sumPay = (rows: TeacherLesson[]) =>
    rows.reduce((total, lesson) => total + payPerLessonCents(hourlyCents, lessonMinutes(lesson)), 0)

  const taughtMinutes = sumMinutes(taught)
  const taughtHours = taughtMinutes / 60
  const earnedCents = sumPay(taught)
  const upcomingCents = sumPay(upcoming)

  // Per student, biggest first — the same hours, just broken out.
  const byStudent = Object.values(
    taught.reduce<Record<string, { name: string; minutes: number; lessons: number; payCents: number }>>(
      (acc, lesson) => {
        const key = lesson.student_id
        const name = lesson.student?.name || "Student"
        acc[key] ??= { name, minutes: 0, lessons: 0, payCents: 0 }
        acc[key].minutes += lessonMinutes(lesson)
        acc[key].lessons += 1
        acc[key].payCents += payPerLessonCents(hourlyCents, lessonMinutes(lesson))
        return acc
      },
      {},
    ),
  ).sort((a, b) => b.minutes - a.minutes)

  const summary = `${monthName} · ${hoursLabel(Math.round(taughtHours * 10) / 10)} taught · ${formatCurrency(
    earnedCents,
  )} at ${formatCurrency(hourlyCents)} an hour`

  const stats = [
    {
      key: "hours",
      label: "Hours taught",
      value: hoursLabel(Math.round(taughtHours * 10) / 10).replace(/ hours?$/, ""),
      footnote: `${taught.length} ${taught.length === 1 ? "lesson" : "lessons"} so far this month`,
    },
    {
      key: "rate",
      label: "Your hourly rate",
      value: formatCurrency(hourlyCents),
      footnote: "Set by the studio",
    },
    {
      key: "pay",
      label: "Pay for the month",
      value: formatCurrency(earnedCents),
      footnote:
        upcoming.length > 0
          ? `${formatCurrency(earnedCents + upcomingCents)} if the rest of the month goes to plan`
          : "All of this month's lessons are done",
    },
  ]

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <PageHeader
        title="Your pay"
        summary={summary}
        actions={
          <div className="flex items-center gap-2">
            <NavSquareLink
              href={`/dashboard/pay?month=${shiftMonth(year, month, -1)}`}
              ariaLabel="Previous month"
            >
              <ChevronLeft className="size-[18px]" aria-hidden />
            </NavSquareLink>
            <NavSquareLink href={`/dashboard/pay?month=${shiftMonth(year, month, 1)}`} ariaLabel="Next month">
              <ChevronRight className="size-[18px]" aria-hidden />
            </NavSquareLink>
          </div>
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
          <h2 className="text-sm font-semibold">How it adds up</h2>
          <span className="text-xs text-muted-foreground">Hours taught × your hourly rate</span>
        </div>

        {taught.length === 0 ? (
          <EmptyState title="Nothing taught yet">
            No lessons have happened in {monthName}. Hours land here as your lessons pass — mark each one on Today or
            Schedule and this stays in step.
          </EmptyState>
        ) : (
          <>
            <p className="text-[15px]">
              <span className="font-semibold">{hoursLabel(Math.round(taughtHours * 10) / 10)}</span>
              {" × "}
              <span className="font-semibold">{formatCurrency(hourlyCents)}</span>
              {" an hour = "}
              <span className="font-serif text-[19px] font-semibold">{formatCurrency(earnedCents)}</span>
            </p>
            <ul className="flex flex-col">
              {byStudent.map((row, index) => (
                <li
                  key={row.name}
                  className={`flex items-center justify-between gap-4 py-3.5 ${
                    index === byStudent.length - 1 ? "" : "border-b"
                  }`}
                >
                  <span className="flex min-w-0 flex-col gap-[3px]">
                    <span className="truncate text-[15px] font-semibold">{row.name}</span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {row.lessons} {row.lessons === 1 ? "lesson" : "lessons"} ·{" "}
                      {hoursLabel(Math.round((row.minutes / 60) * 10) / 10)}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold">{formatCurrency(row.payCents)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminCard>

      {unpaid.length > 0 && (
        <AdminCard className="flex flex-col gap-3 pb-[26px]">
          <h2 className="text-sm font-semibold">Not counted</h2>
          <p className="text-[13px] text-muted-foreground">
            A lesson marked no-show pays nothing unless the studio records a make-up for it. These are excluded from the
            hours above.
          </p>
          <ul className="flex flex-col">
            {unpaid.map((lesson, index) => (
              <li
                key={lesson.id}
                className={`flex items-center justify-between gap-4 py-3 ${
                  index === unpaid.length - 1 ? "" : "border-b"
                }`}
              >
                <span className="flex min-w-0 flex-col gap-[3px]">
                  <span className="truncate text-sm font-semibold">{lesson.student?.name || "Student"}</span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {formatShortDate(lesson.start_time)} ·{" "}
                    {formatTimeRange(
                      minutesToTimeString(minutesUtc(new Date(lesson.start_time))),
                      minutesToTimeString(minutesUtc(new Date(lesson.end_time))),
                    )}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] text-destructive">No-show</span>
              </li>
            ))}
          </ul>
        </AdminCard>
      )}

      <p className="px-1 text-[13px] text-muted-foreground">
        Showing {anchor === monthKey(today.getFullYear(), today.getMonth() + 1) ? "this month" : monthName}. Pay is your
        hours at your hourly rate — it isn&apos;t a share of what students are billed.
      </p>
    </div>
  )
}
