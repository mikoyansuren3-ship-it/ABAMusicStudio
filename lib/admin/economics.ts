import type { Booking, StudentBilling, StudentSlot } from "@/lib/types"

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

type SlotOverrides = Pick<StudentSlot, "duration_minutes" | "rate_cents">
type BillingDefaults = Pick<StudentBilling, "rate_cents" | "duration_minutes">

/**
 * The standing weekly arrangement across specific slots, honoring each slot's
 * rate/duration overrides (a vocal hour and a piano half-hour can differ).
 */
export function weeklyPlanFromSlots(
  slots: SlotOverrides[],
  billing: BillingDefaults,
  hourlyCents: number,
): MoneyBreakdown {
  let grossCents = 0
  let payCents = 0
  for (const slot of slots) {
    grossCents += slot.rate_cents ?? billing.rate_cents
    payCents += payPerLessonCents(hourlyCents, slot.duration_minutes ?? billing.duration_minutes)
  }
  return { grossCents, payCents, profitCents: grossCents - payCents }
}

/** What one lesson earns: its stamped snapshot, else the student's standing rate. */
export function lessonRateCents(lesson: Pick<Booking, "rate_cents">, fallbackRateCents: number) {
  return lesson.rate_cents ?? fallbackRateCents
}

/** A lesson's real length from its own start/end (slot overrides shape these). */
export function lessonDurationMinutes(lesson: Pick<Booking, "start_time" | "end_time">, fallbackMinutes: number) {
  const minutes = (new Date(lesson.end_time).getTime() - new Date(lesson.start_time).getTime()) / 60000
  return Number.isFinite(minutes) && minutes > 0 ? minutes : fallbackMinutes
}

/** A lesson counts unless it was cancelled or missed without a make-up. */
export function lessonCounts(lesson: Pick<Booking, "status" | "attendance" | "made_up_on">) {
  if (lesson.status === "cancelled") return false
  return !(lesson.attendance === "missed" && !lesson.made_up_on)
}

type LessonForActuals = Pick<
  Booking,
  "status" | "attendance" | "made_up_on" | "rate_cents" | "start_time" | "end_time"
>

/**
 * What one student's lessons actually earned (and cost) in a period, lesson
 * by lesson: each uses its own rate snapshot and real duration, falling back
 * to the student's standing billing for legacy rows.
 */
export function periodActuals(
  lessons: LessonForActuals[],
  fallbackRateCents: number,
  hourlyCents: number,
  fallbackDurationMinutes: number,
): MoneyBreakdown & { countedLessons: number } {
  let grossCents = 0
  let payCents = 0
  let countedLessons = 0
  for (const lesson of lessons) {
    if (!lessonCounts(lesson)) continue
    countedLessons += 1
    grossCents += lessonRateCents(lesson, fallbackRateCents)
    payCents += payPerLessonCents(hourlyCents, lessonDurationMinutes(lesson, fallbackDurationMinutes))
  }
  return { grossCents, payCents, profitCents: grossCents - payCents, countedLessons }
}
