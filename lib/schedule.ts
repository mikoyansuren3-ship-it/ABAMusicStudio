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

export function isSlotBookable({
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
}) {
  if (end <= new Date()) return false

  const slotStartMinutes = toMinutes(timeFromDate(start))
  const slotEndMinutes = toMinutes(timeFromDate(end))
  const exception = exceptions.find((item) => item.exception_date === dateKey(start))

  if (exception) {
    if (!exception.is_available) return false
    if (!exception.start_time || !exception.end_time) return false

    const exceptionStart = toMinutes(exception.start_time)
    const exceptionEnd = toMinutes(exception.end_time)
    if (slotStartMinutes < exceptionStart || slotEndMinutes > exceptionEnd) return false
  } else {
    const dayAvailability = availability.find((item) => item.day_of_week === start.getDay() && item.is_active)
    if (!dayAvailability) return false

    const availableStart = toMinutes(dayAvailability.start_time)
    const availableEnd = toMinutes(dayAvailability.end_time)
    if (slotStartMinutes < availableStart || slotEndMinutes > availableEnd) return false
  }

  return !existingBookings.some((booking) => {
    if (booking.status === "cancelled") return false

    const bookingStart = new Date(booking.start_time)
    const bookingEnd = new Date(booking.end_time)
    return start < bookingEnd && end > bookingStart
  })
}
