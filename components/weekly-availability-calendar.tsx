"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { Availability, AvailabilityException, Booking } from "@/lib/types"

interface WeeklyAvailabilityCalendarProps {
  availability: Availability[]
  exceptions: AvailabilityException[]
  existingBookings: Booking[]
  onSelectSlot?: (start: Date, end: Date) => void
  selectedSlot?: { start: Date; end: Date } | null
  lessonDuration?: number
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const hours = Array.from({ length: 12 }, (_, i) => i + 9) // 9am to 8pm

export function WeeklyAvailabilityCalendar({
  availability,
  exceptions,
  existingBookings,
  onSelectSlot,
  selectedSlot,
  lessonDuration = 30,
}: WeeklyAvailabilityCalendarProps) {
  // Get the current week's dates
  const weekDates = useMemo(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Start from Monday

    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }, [])

  // Check if a time slot is available
  function isSlotAvailable(date: Date, hour: number, minute: number): boolean {
    const dayOfWeek = date.getDay()
    const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

    // Check for exceptions on this date
    const dateString = date.toISOString().split("T")[0]
    const exception = exceptions.find((e) => e.exception_date === dateString)

    if (exception) {
      if (!exception.is_available) return false
      if (exception.start_time && exception.end_time) {
        return timeString >= exception.start_time && timeString < exception.end_time
      }
    }

    // Check regular availability
    const dayAvailability = availability.find((a) => a.day_of_week === dayOfWeek && a.is_active)
    if (!dayAvailability) return false

    const isWithinHours = timeString >= dayAvailability.start_time && timeString < dayAvailability.end_time

    // Check for existing bookings
    const slotStart = new Date(date)
    slotStart.setHours(hour, minute, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + lessonDuration)

    const hasConflict = existingBookings.some((booking) => {
      const bookingStart = new Date(booking.start_time)
      const bookingEnd = new Date(booking.end_time)
      return slotStart < bookingEnd && slotEnd > bookingStart && booking.status !== "cancelled"
    })

    return isWithinHours && !hasConflict
  }

  function handleSlotClick(date: Date, hour: number, minute: number) {
    if (!onSelectSlot) return
    if (!isSlotAvailable(date, hour, minute)) return

    const start = new Date(date)
    start.setHours(hour, minute, 0, 0)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + lessonDuration)

    onSelectSlot(start, end)
  }

  function isSelectedSlot(date: Date, hour: number, minute: number): boolean {
    if (!selectedSlot) return false
    const slotStart = new Date(date)
    slotStart.setHours(hour, minute, 0, 0)
    return selectedSlot.start.getTime() === slotStart.getTime()
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b bg-muted/30">
          <div className="p-2" />
          {weekDates.map((date, i) => (
            <div key={i} className="border-l p-2 text-center">
              <div className="text-xs text-muted-foreground">{dayNames[date.getDay()]}</div>
              <div className="text-sm font-medium">{date.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="divide-y">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[60px_repeat(6,1fr)]">
              <div className="flex items-start justify-end p-2 text-xs text-muted-foreground">
                {hour % 12 || 12}:00 {hour < 12 ? "AM" : "PM"}
              </div>
              {weekDates.map((date, dayIndex) => {
                const available00 = isSlotAvailable(date, hour, 0)
                const available30 = isSlotAvailable(date, hour, 30)
                const selected00 = isSelectedSlot(date, hour, 0)
                const selected30 = isSelectedSlot(date, hour, 30)

                return (
                  <div key={dayIndex} className="flex flex-col border-l">
                    <button
                      type="button"
                      disabled={!available00 || !onSelectSlot}
                      onClick={() => handleSlotClick(date, hour, 0)}
                      className={cn(
                        "h-6 w-full border-b transition-colors",
                        available00
                          ? selected00
                            ? "bg-accent text-accent-foreground"
                            : "bg-accent/10 hover:bg-accent/20"
                          : "bg-muted/50",
                        onSelectSlot && available00 && "cursor-pointer",
                      )}
                    />
                    <button
                      type="button"
                      disabled={!available30 || !onSelectSlot}
                      onClick={() => handleSlotClick(date, hour, 30)}
                      className={cn(
                        "h-6 w-full transition-colors",
                        available30
                          ? selected30
                            ? "bg-accent text-accent-foreground"
                            : "bg-accent/10 hover:bg-accent/20"
                          : "bg-muted/50",
                        onSelectSlot && available30 && "cursor-pointer",
                      )}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 border-t p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-accent/10" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-accent" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-muted/50" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  )
}
