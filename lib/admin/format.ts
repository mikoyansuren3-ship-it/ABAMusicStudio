import type { Availability } from "@/lib/types"

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
export const DAY_ABBREV = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/** "15:00" or "15:00:00" → minutes since midnight. */
export function timeToMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":")
  return Number(hours) * 60 + Number(minutes)
}

/** Minutes since midnight → "3:00 PM". */
export function formatMinutes(totalMinutes: number) {
  const hours24 = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60
  const meridiem = hours24 >= 12 ? "PM" : "AM"
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(minutes).padStart(2, "0")} ${meridiem}`
}

/** "15:00[:00]" → "3:00 PM". */
export function formatClockTime(time: string) {
  return formatMinutes(timeToMinutes(time))
}

/** "15:00", "19:00" → "3:00 – 7:00 PM" (start drops its meridiem when both match). */
export function formatTimeRange(start: string, end: string) {
  const startLabel = formatClockTime(start)
  const endLabel = formatClockTime(end)
  const [startTime, startMeridiem] = startLabel.split(" ")
  const [, endMeridiem] = endLabel.split(" ")
  if (startMeridiem === endMeridiem) return `${startTime} – ${endLabel}`
  return `${startLabel} – ${endLabel}`
}

const NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
]

/** 4 → "four"; larger numbers fall back to digits. */
export function numberWord(n: number) {
  return Number.isInteger(n) && n >= 0 && n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n)
}

/** "4 hours", "1 hour", "2.5 hours". */
export function hoursLabel(hours: number) {
  const rounded = Math.round(hours * 10) / 10
  return `${rounded} ${rounded === 1 ? "hour" : "hours"}`
}

/** Compress sorted day indices into "Mon–Fri" / "Mon, Wed, Fri" style runs. */
export function compressDays(dayIndices: number[]) {
  if (dayIndices.length === 0) return ""
  const sorted = [...new Set(dayIndices)].sort((a, b) => a - b)
  const runs: string[] = []
  let runStart = sorted[0]
  let prev = sorted[0]
  for (const day of sorted.slice(1)) {
    if (day === prev + 1) {
      prev = day
      continue
    }
    runs.push(runStart === prev ? DAY_ABBREV[runStart] : `${DAY_ABBREV[runStart]}–${DAY_ABBREV[prev]}`)
    runStart = day
    prev = day
  }
  runs.push(runStart === prev ? DAY_ABBREV[runStart] : `${DAY_ABBREV[runStart]}–${DAY_ABBREV[prev]}`)
  return runs.join(", ")
}

export interface AvailabilitySummary {
  /** e.g. "Mon–Fri · 3:00 – 7:00 PM" or "18 hours across 4 days" or "No hours set". */
  daysLine: string
  /** e.g. "20 hours open each week". */
  hoursLine: string
  hoursPerWeek: number
  openDays: number[]
}

/** Summarize active weekly availability for the sidebar footer and page summaries. */
export function summarizeAvailability(availability: Availability[]): AvailabilitySummary {
  const active = availability.filter((slot) => slot.is_active)
  const openDays = [...new Set(active.map((slot) => slot.day_of_week))].sort((a, b) => a - b)
  const hoursPerWeek =
    active.reduce((sum, slot) => sum + (timeToMinutes(slot.end_time) - timeToMinutes(slot.start_time)), 0) / 60

  if (active.length === 0) {
    return { daysLine: "No hours set", hoursLine: "The website can't offer lessons yet", hoursPerWeek: 0, openDays }
  }

  const ranges = new Set(active.map((slot) => `${slot.start_time.slice(0, 5)}-${slot.end_time.slice(0, 5)}`))
  const sameWindowEachDay = ranges.size === 1 && openDays.length === active.length
  const daysLine = sameWindowEachDay
    ? `${compressDays(openDays)} · ${formatTimeRange(active[0].start_time, active[0].end_time)}`
    : `${hoursLabel(hoursPerWeek)} across ${openDays.length} ${openDays.length === 1 ? "day" : "days"}`

  return {
    daysLine,
    hoursLine: `${hoursLabel(hoursPerWeek)} open each week`,
    hoursPerWeek,
    openDays,
  }
}

/** Currency without cents when whole: 4500 → "$45", 4550 → "$45.50". */
export function formatCurrencyCompact(cents: number) {
  const hasCents = cents % 100 !== 0
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(cents / 100)
}

/** Local-date key "2026-08-05". */
export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Weekly slot summary: "Mon/Wed · 4:00 PM" when every slot shares a time,
 * otherwise "Mon 3:00 PM · Wed 4:00 PM".
 */
export function slotsLabel(slots: { day_of_week: number; lesson_time: string }[]) {
  if (slots.length === 0) return null
  const sorted = [...slots].sort((a, b) => a.day_of_week - b.day_of_week)
  const times = new Set(sorted.map((slot) => slot.lesson_time.slice(0, 5)))
  if (times.size === 1) {
    return `${compressDays(sorted.map((slot) => slot.day_of_week))} · ${formatClockTime(sorted[0].lesson_time)}`
  }
  return sorted.map((slot) => `${DAY_ABBREV[slot.day_of_week]} ${formatClockTime(slot.lesson_time)}`).join(" · ")
}

/** Initials for avatar circles: "Ashot Mikoyan" → "AM". */
export function initials(name: string | null | undefined, fallback = "?") {
  if (!name) return fallback
  const parts = name.trim().split(/\s+/).slice(0, 2)
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
  return letters || fallback
}

/** Time-of-day greeting from a local hour. */
export function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
