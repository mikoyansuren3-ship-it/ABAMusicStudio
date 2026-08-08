import type { Availability, AvailabilityException } from "@/lib/types"
import { DAY_ABBREV, parseDateKey, timeToMinutes, toDateKey } from "@/lib/admin/format"

/** ?week= cursor: a valid date key anchors the 7-day window, else today. */
export function resolveWeekAnchor(weekParam: string | undefined, today: Date) {
  if (weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)) {
    const parsed = parseDateKey(weekParam)
    if (!Number.isNaN(parsed.getTime()) && parsed.getFullYear() >= 2000 && parsed.getFullYear() <= 2100) {
      return parsed
    }
  }
  return today
}

/** "August 5 – 11", "August 30 – September 5", with the year when it isn't this year. */
export function weekRangeLabel(start: Date, end: Date) {
  const startMonth = start.toLocaleDateString("en-US", { month: "long" })
  const endMonth = end.toLocaleDateString("en-US", { month: "long" })
  const yearSuffix = end.getFullYear() === new Date().getFullYear() ? "" : `, ${end.getFullYear()}`
  if (startMonth === endMonth) return `${startMonth} ${start.getDate()} – ${end.getDate()}${yearSuffix}`
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}${yearSuffix}`
}

export interface WeekDaySkeleton {
  key: string
  date: Date
  eyebrow: string
  isToday: boolean
  dateLabel: string
  closed: boolean
  closedReason: string | null
  windowStart: number
  windowEnd: number
}

export interface WeekSkeleton {
  days: WeekDaySkeleton[]
  hourLabels: string[]
  scaleStart: number
  scaleEnd: number
}

function formatHour(totalMinutes: number) {
  const hours24 = Math.floor(totalMinutes / 60) % 24
  const meridiem = hours24 >= 12 ? "PM" : "AM"
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12} ${meridiem}`
}

/**
 * Compute the 7 day rows (open windows, closures, hour scale) for a week
 * starting at `anchor`. Shared by the Schedule page and teacher calendars so
 * their bands never diverge. Lessons are attached by the caller.
 */
export function buildWeekSkeleton({
  anchor,
  today,
  availability,
  exceptions,
}: {
  anchor: Date
  today: Date
  availability: Availability[]
  exceptions: AvailabilityException[]
}): WeekSkeleton {
  // Hour scale: the widest open window this week.
  let scaleStart = Number.POSITIVE_INFINITY
  let scaleEnd = Number.NEGATIVE_INFINITY
  for (const slot of availability) {
    scaleStart = Math.min(scaleStart, timeToMinutes(slot.start_time))
    scaleEnd = Math.max(scaleEnd, timeToMinutes(slot.end_time))
  }
  for (const exception of exceptions) {
    if (exception.is_available && exception.start_time && exception.end_time) {
      scaleStart = Math.min(scaleStart, timeToMinutes(exception.start_time))
      scaleEnd = Math.max(scaleEnd, timeToMinutes(exception.end_time))
    }
  }
  if (!Number.isFinite(scaleStart) || !Number.isFinite(scaleEnd) || scaleEnd <= scaleStart) {
    scaleStart = 15 * 60
    scaleEnd = 19 * 60
  }

  const hourLabels: string[] = []
  for (let minute = Math.floor(scaleStart / 60) * 60; minute <= Math.ceil(scaleEnd / 60) * 60; minute += 60) {
    hourLabels.push(formatHour(minute))
  }

  const days: WeekDaySkeleton[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(anchor)
    date.setDate(date.getDate() + i)
    const key = toDateKey(date)
    const isToday = key === toDateKey(today)
    const exception = exceptions.find((item) => item.exception_date === key)
    const daySlots = availability.filter((slot) => slot.day_of_week === date.getDay())

    let closed: boolean
    let windowStart = scaleStart
    let windowEnd = scaleEnd
    let closedReason: string | null = null
    if (exception) {
      closed = !exception.is_available || !exception.start_time || !exception.end_time
      closedReason = exception.reason
      if (!closed) {
        windowStart = timeToMinutes(exception.start_time!)
        windowEnd = timeToMinutes(exception.end_time!)
      }
    } else {
      closed = daySlots.length === 0
      if (!closed) {
        windowStart = Math.min(...daySlots.map((slot) => timeToMinutes(slot.start_time)))
        windowEnd = Math.max(...daySlots.map((slot) => timeToMinutes(slot.end_time)))
      }
    }

    return {
      key,
      date,
      eyebrow: isToday ? `Today · ${DAY_ABBREV[date.getDay()]}` : DAY_ABBREV[date.getDay()],
      isToday,
      dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      closed,
      closedReason,
      windowStart,
      windowEnd,
    }
  })

  return { days, hourLabels, scaleStart, scaleEnd }
}
