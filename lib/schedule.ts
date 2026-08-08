import type { Availability, AvailabilityException, Booking } from "@/lib/types"

type BookingSlot = Pick<Booking, "start_time" | "end_time" | "status">

function toMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":")
  return Number(hours) * 60 + Number(minutes)
}

function timeFromDate(date: Date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
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
  if (end <= new Date()) return "past"

  const overlaps = existingBookings.some((booking) => {
    if (booking.status === "cancelled") return false

    const bookingStart = new Date(booking.start_time)
    const bookingEnd = new Date(booking.end_time)
    return start < bookingEnd && end > bookingStart
  })
  if (overlaps) return "overlap"

  const slotStartMinutes = toMinutes(timeFromDate(start))
  const slotEndMinutes = toMinutes(timeFromDate(end))
  const exception = exceptions.find((item) => item.exception_date === dateKey(start))

  if (exception) {
    if (!exception.is_available) return "outside_availability"
    if (!exception.start_time || !exception.end_time) return "outside_availability"

    const exceptionStart = toMinutes(exception.start_time)
    const exceptionEnd = toMinutes(exception.end_time)
    if (slotStartMinutes < exceptionStart || slotEndMinutes > exceptionEnd) return "outside_availability"
    return null
  }

  const dayAvailability = availability.find((item) => item.day_of_week === start.getDay() && item.is_active)
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
