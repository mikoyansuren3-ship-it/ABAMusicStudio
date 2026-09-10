import { AdminCard, EmptyState, PageHeader } from "@/components/admin/ui"
import { UnlinkedNotice } from "@/components/teacher/unlinked-notice"
import { getTeacherContext } from "@/lib/teacher/context"
import type { TeacherLesson } from "@/lib/teacher/week"
import { initials, toDateKey } from "@/lib/admin/format"
import { formatDateTime } from "@/lib/portal/format"
import { experienceLabel } from "@/lib/portal/format"
import { studioNow, studioToday, wallClockToUtc } from "@/lib/studio-time"
import type { Student } from "@/lib/types"

export const metadata = {
  title: "Your students",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

/** How far back the roster's attendance tally looks. */
const HISTORY_DAYS = 30

interface RosterRow {
  student: Student
  nextLesson: TeacherLesson | null
  came: number
  missed: number
  unmarked: number
}

function RosterList({ rows: listRows }: { rows: RosterRow[] }) {
  return (
    <ul className="flex flex-col">
      {listRows.map((row, index) => (
        <li
          key={row.student.id}
          className={`flex flex-col gap-3 py-[18px] sm:flex-row sm:items-center sm:gap-4 ${
            index === listRows.length - 1 ? "" : "border-b"
          }`}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent-strong">
            {initials(row.student.name)}
          </span>
          <span className="flex min-w-0 flex-[1.6] flex-col gap-[3px]">
            <span className="truncate font-serif text-[19px] font-semibold">{row.student.name}</span>
            <span className="truncate text-[13px] text-muted-foreground">
              {[
                row.student.experience_level ? experienceLabel(row.student.experience_level) : "Level not set",
                `${row.student.preferred_lesson_duration} min`,
                row.student.is_active ? null : "Inactive",
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Next lesson
            </span>
            <span className="truncate text-sm">
              {row.nextLesson ? formatDateTime(row.nextLesson.start_time) : "Not scheduled"}
            </span>
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Last {HISTORY_DAYS} days
            </span>
            <span className="text-sm">
              {row.came} came · <span className={row.missed > 0 ? "text-destructive" : ""}>{row.missed} no-show</span>
            </span>
            {row.unmarked > 0 && (
              <span className="text-xs text-muted-foreground">{row.unmarked} not marked yet</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default async function TeacherStudentsPage() {
  const { supabase, teacher } = await getTeacherContext()
  if (!teacher) return <UnlinkedNotice />

  const now = studioNow()
  const today = studioToday()
  const from = new Date(today)
  from.setDate(from.getDate() - HISTORY_DAYS)
  const to = new Date(today)
  to.setDate(to.getDate() + HISTORY_DAYS)

  const [studentsRes, lessonsRes] = await Promise.all([
    // RLS scopes this to the students this teacher actually teaches.
    supabase.from("students").select("*").order("name"),
    supabase
      .from("bookings")
      .select("*, student:students(id, name)")
      .eq("teacher_id", teacher.id)
      .neq("status", "cancelled")
      .gte("start_time", wallClockToUtc(toDateKey(from), "00:00:00").toISOString())
      .lt("start_time", wallClockToUtc(toDateKey(to), "00:00:00").toISOString())
      .order("start_time"),
  ])

  const students = (studentsRes.data || []) as Student[]
  const lessons = (lessonsRes.data || []) as TeacherLesson[]

  const rows = students.map((student) => {
    const mine = lessons.filter((lesson) => lesson.student_id === student.id)
    return {
      student,
      nextLesson: mine.find((lesson) => new Date(lesson.start_time) >= now) ?? null,
      came: mine.filter((lesson) => lesson.attendance === "on_time").length,
      missed: mine.filter((lesson) => lesson.attendance === "missed").length,
      unmarked: mine.filter((lesson) => !lesson.attendance && new Date(lesson.start_time) <= now).length,
    }
  })

  const activeRows = rows.filter((row) => row.student.is_active)
  const inactiveRows = rows.filter((row) => !row.student.is_active)
  const summary =
    students.length === 0
      ? "No students are assigned to you yet"
      : `${activeRows.length} active ${activeRows.length === 1 ? "student" : "students"} · attendance over the last ${HISTORY_DAYS} days`

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <PageHeader title="Your students" summary={summary} />

      <AdminCard className="pb-[26px]">
        {activeRows.length === 0 ? (
          <EmptyState title="No students yet">
            Students appear here once an administrator assigns them to you — either as their teacher, or on one of their
            weekly lesson slots.
          </EmptyState>
        ) : (
          <RosterList rows={activeRows} />
        )}
      </AdminCard>

      {inactiveRows.length > 0 && (
        <AdminCard className="flex flex-col gap-3 pb-[26px]">
          <h2 className="text-sm font-semibold text-muted-foreground">Inactive</h2>
          <RosterList rows={inactiveRows} />
        </AdminCard>
      )}
    </div>
  )
}
