import type { Availability, AvailabilityException, Booking } from "@/lib/types"
import { dateKeyUtc, studioNow } from "@/lib/studio-time"

type BookingSlot = Pick<Booking, "start_time" | "end_time" | "status">

function toMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":")
  return Number(hours) * 60 + Number(minutes)
}

// Candidate slots are studio wall-clock-as-UTC (see lib/studio-time.ts),
// so their wall-clock parts live on the UTC accessors.
function timeFromDate(date: Date) {
  return `${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}`
}

export type SlotIssue = "past" | "outside_availability" | "overlap" | null

/**
 * Classify a requested slot. "outside_availability" is soft — the admin may
 * confirm past it — while "past" and "overlap" are hard rejections.
 */
export function classifySlot({
  start,
  end,
  availability,
  exceptions,
  existingBookings,
}: {
  start: Date
  end: Date
  availability: Availability[]
  exceptions: AvailabilityException[]
  existingBookings: BookingSlot[]
}): SlotIssue {
  if (end <= studioNow()) return "past"

  const overlaps = existingBookings.some((booking) => {
    if (booking.status === "cancelled") return false

    const bookingStart = new Date(booking.start_time)
    const bookingEnd = new Date(booking.end_time)
    return start < bookingEnd && end > bookingStart
  })
  if (overlaps) return "overlap"

  const slotStartMinutes = toMinutes(timeFromDate(start))
  const slotEndMinutes = toMinutes(timeFromDate(end))
  const exception = exceptions.find((item) => item.exception_date === dateKeyUtc(start))

  if (exception) {
    if (!exception.is_available) return "outside_availability"
    if (!exception.start_time || !exception.end_time) return "outside_availability"

    const exceptionStart = toMinutes(exception.start_time)
    const exceptionEnd = toMinutes(exception.end_time)
    if (slotStartMinutes < exceptionStart || slotEndMinutes > exceptionEnd) return "outside_availability"
    return null
  }

  const dayAvailability = availability.find((item) => item.day_of_week === start.getUTCDay() && item.is_active)
  if (!dayAvailability) return "outside_availability"

  const availableStart = toMinutes(dayAvailability.start_time)
  const availableEnd = toMinutes(dayAvailability.end_time)
  if (slotStartMinutes < availableStart || slotEndMinutes > availableEnd) return "outside_availability"

  return null
}

export function isSlotBookable(params: {
  start: Date
  end: Date
  availability: Availability[]
  exceptions: AvailabilityException[]
  existingBookings: BookingSlot[]
}) {
  return classifySlot(params) === null
}
