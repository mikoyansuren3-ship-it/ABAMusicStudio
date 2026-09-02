import type { createClient } from "@/lib/supabase/server"
import type { WeekBandDay, WeekBandTone } from "@/components/admin/week-bands"
import type { Availability, AvailabilityException, Booking } from "@/lib/types"
import { buildWeekSkeleton } from "@/lib/admin/week"
import { formatTimeRange, minutesToTimeString, toDateKey } from "@/lib/admin/format"
import { formatTime } from "@/lib/portal/format"
import { dateKeyUtc, minutesUtc, studioNow, wallClockToUtc } from "@/lib/studio-time"

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

export type TeacherLesson = Booking & { student: { id: string; name: string } | null }

/**
 * How a lesson reads on the calendar. An unmarked lesson that has already
 * started is the one that wants the teacher's attention, so it gets its own
 * "past" treatment rather than looking like an upcoming lesson.
 */
export function lessonTone(lesson: TeacherLesson, now: Date): WeekBandTone {
  if (lesson.attendance === "on_time") return "came"
  if (lesson.attendance === "missed") return "missed"
  return new Date(lesson.start_time) <= now ? "past" : "default"
}

/** Lessons that have started but carry no mark yet — the teacher's to-do. */
export function unmarkedLessons(lessons: TeacherLesson[], now: Date) {
  return lessons.filter((lesson) => !lesson.attendance && new Date(lesson.start_time) <= now)
}

/**
 * One teacher's week: their own lessons (stamped `bookings.teacher_id`) laid
 * onto the studio's open-hours skeleton, so the teacher calendar and the admin
 * one are the same picture. Lessons are never materialized here — that is an
 * admin-only write (lib/admin/lessons.ts); this surface reads what exists.
 */
export async function loadTeacherWeek({
  supabase,
  teacherId,
  anchor,
  today,
  teacherName,
}: {
  supabase: ServerSupabase
  teacherId: string
  anchor: Date
  today: Date
  teacherName: string
}) {
  const weekEndExclusive = new Date(anchor)
  weekEndExclusive.setDate(weekEndExclusive.getDate() + 7)
  const weekLast = new Date(anchor)
  weekLast.setDate(weekLast.getDate() + 6)

  const [lessonsRes, availabilityRes, exceptionsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, student:students(id, name)")
      .eq("teacher_id", teacherId)
      .neq("status", "cancelled")
      .gte("start_time", wallClockToUtc(toDateKey(anchor), "00:00:00").toISOString())
      .lt("start_time", wallClockToUtc(toDateKey(weekEndExclusive), "00:00:00").toISOString())
      .order("start_time"),
    supabase.from("availability").select("*").eq("is_active", true),
    supabase
      .from("availability_exceptions")
      .select("*")
      .gte("exception_date", toDateKey(anchor))
      .lte("exception_date", toDateKey(weekLast)),
  ])

  const lessons = (lessonsRes.data || []) as TeacherLesson[]
  const availability = (availabilityRes.data || []) as Availability[]
  const exceptions = (exceptionsRes.data || []) as AvailabilityException[]

  const skeleton = buildWeekSkeleton({ anchor, today, availability, exceptions })
  const now = studioNow()

  const days: WeekBandDay[] = skeleton.days.map((day) => {
    const dayLessons = lessons.filter((lesson) => dateKeyUtc(lesson.start_time) === day.key)
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
          ? "No lessons"
          : null,
      windowStart: day.windowStart,
      windowEnd: day.windowEnd,
      lessons: dayLessons.map((lesson) => {
        const start = new Date(lesson.start_time)
        const end = new Date(lesson.end_time)
        const range = formatTimeRange(minutesToTimeString(minutesUtc(start)), minutesToTimeString(minutesUtc(end)))
        const name = lesson.student?.name || "Student"
        const tone = lessonTone(lesson, now)
        const state = tone === "came" ? " · came" : tone === "missed" ? " · no-show" : ""
        return {
          id: lesson.id,
          label: `${name} · ${range}`,
          title: `${name}, ${formatTime(lesson.start_time)} – ${formatTime(lesson.end_time)}${state}`,
          startMinutes: minutesUtc(start),
          durationMinutes: Math.max((end.getTime() - start.getTime()) / 60000, 15),
          tone,
        }
      }),
    }
  })

  return {
    lessons,
    days,
    weekLast,
    hourLabels: skeleton.hourLabels,
    scaleStart: skeleton.scaleStart,
    scaleEnd: skeleton.scaleEnd,
    teacherName,
  }
}
