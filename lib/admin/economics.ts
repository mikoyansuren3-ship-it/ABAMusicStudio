import type { Booking } from "@/lib/types"

/**
 * Teacher and studio money math. Two distinct kinds of figures:
 *
 * - "Planned weekly" figures describe the standing arrangement (the
 *   spreadsheet's job): rate × slots per week, pay per lesson × slots.
 * - "Period actuals" come from materialized lessons and follow the ledger's
 *   attendance rule — a lesson missed without a make-up earns nothing and
 *   pays nothing. Monthly numbers are real calendar-month counts, never
 *   "weekly × 4".
 */

export interface MoneyBreakdown {
  grossCents: number
  payCents: number
  profitCents: number
}

/** Pay per lesson = hourly rate × duration / 60 (e.g. $30/hr → $15 per 30 min). */
export function payPerLessonCents(hourlyCents: number, durationMinutes: number) {
  return Math.round((hourlyCents * durationMinutes) / 60)
}

/** The standing weekly arrangement for one student. */
export function weeklyPlan(
  rateCents: number,
  hourlyCents: number,
  durationMinutes: number,
  slotCount: number,
): MoneyBreakdown {
  const grossCents = rateCents * slotCount
  const payCents = payPerLessonCents(hourlyCents, durationMinutes) * slotCount
  return { grossCents, payCents, profitCents: grossCents - payCents }
}

/** A lesson counts unless it was cancelled or missed without a make-up. */
export function lessonCounts(lesson: Pick<Booking, "status" | "attendance" | "made_up_on">) {
  if (lesson.status === "cancelled") return false
  return !(lesson.attendance === "missed" && !lesson.made_up_on)
}

/** What one student's lessons actually earned (and cost) in a period. */
export function periodActuals(
  lessons: Pick<Booking, "status" | "attendance" | "made_up_on">[],
  rateCents: number,
  hourlyCents: number,
  durationMinutes: number,
): MoneyBreakdown & { countedLessons: number } {
  const countedLessons = lessons.filter(lessonCounts).length
  const grossCents = rateCents * countedLessons
  const payCents = payPerLessonCents(hourlyCents, durationMinutes) * countedLessons
  return { grossCents, payCents, profitCents: grossCents - payCents, countedLessons }
}
