"use server"

import { createClient } from "@/lib/supabase/server"
import { classifySlot } from "@/lib/schedule"
import { weekKeyOf } from "@/lib/admin/lessons"
import { dateKeyUtc, studioNow, wallClockToUtc } from "@/lib/studio-time"
import { revalidatePath } from "next/cache"

function revalidateScheduleViews() {
  revalidatePath("/admin/schedule")
  revalidatePath("/admin/money")
  revalidatePath("/admin/teachers")
  revalidatePath("/admin")
}

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const studentId = formData.get("student_id") as string
  const date = formData.get("date") as string
  const startTime = formData.get("start_time") as string
  const duration = Number.parseInt(formData.get("duration") as string)
  const confirmOutside = formData.get("confirm_outside") === "1"

  const startDateTime = wallClockToUtc(date, startTime)
  const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

  if (!studentId || Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
    return { error: "Please choose a student, date, and time." }
  }

  const [availabilityRes, exceptionsRes, bookingsRes, studentRes] = await Promise.all([
    supabase.from("availability").select("*").eq("is_active", true),
    supabase
      .from("availability_exceptions")
      .select("*")
      .gte("exception_date", dateKeyUtc(studioNow())),
    supabase
      .from("bookings")
      .select("start_time,end_time,status")
      .gte("start_time", studioNow().toISOString())
      .in("status", ["confirmed", "pending"]),
    supabase
      .from("students")
      .select("teacher_id, billing:student_billing(rate_cents)")
      .eq("id", studentId)
      .single(),
  ])

  const issue = classifySlot({
    start: startDateTime,
    end: endDateTime,
    availability: availabilityRes.data || [],
    exceptions: exceptionsRes.data || [],
    existingBookings: bookingsRes.data || [],
  })

  if (issue === "past") return { error: "That time is in the past." }
  if (issue === "overlap") return { error: "Another lesson is already booked then." }
  if (issue === "outside_availability" && !confirmOutside) {
    return {
      error: "That time is outside the studio's open hours.",
      code: "outside_availability" as const,
    }
  }

  const billing = studentRes.data?.billing
  const billingRow = Array.isArray(billing) ? (billing[0] ?? null) : (billing ?? null)

  const { error } = await supabase.from("bookings").insert({
    student_id: studentId,
    teacher_id: studentRes.data?.teacher_id ?? null,
    // Snapshot the standing rate like generated lessons do, so the ledger
    // never has to guess what a hand-booked lesson earned.
    rate_cents: billingRow?.rate_cents ?? null,
    start_time: startDateTime.toISOString(),
    end_time: endDateTime.toISOString(),
    status: "confirmed",
  })

  if (error) return { error: error.message }

  revalidateScheduleViews()
  return { success: true }
}

/**
 * Approve or decline a pending reschedule request.
 *
 * Approving a moved WEEKLY lesson detaches it from the weekly pattern
 * (`is_recurring` false) so later slot edits never snap it back; it keeps
 * `recurring_day_of_week` so the generator knows that week's lesson exists
 * and doesn't recreate the original day.
 *
 * Declining puts a moved weekly lesson back on its slot's day and time for
 * that week (the original lesson stands), rather than leaving a cancelled
 * row at the requested time — which would drop the lesson from the schedule
 * entirely. If the slot no longer exists, the row is simply cancelled.
 */
export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = await createClient()

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, student_id, start_time, end_time, status, is_recurring, recurring_day_of_week")
    .eq("id", bookingId)
    .single()
  if (bookingError || !booking) return { error: "Lesson not found." }

  const movedWeeklyLesson =
    booking.status === "pending" && booking.is_recurring && booking.recurring_day_of_week !== null

  let patch: Record<string, unknown> = { status }

  if (movedWeeklyLesson && status === "confirmed") {
    patch = { status, is_recurring: false }
  } else if (movedWeeklyLesson && status === "cancelled") {
    const { data: slot } = await supabase
      .from("student_slots")
      .select("lesson_time, duration_minutes")
      .eq("student_id", booking.student_id)
      .eq("day_of_week", booking.recurring_day_of_week!)
      .maybeSingle()

    if (slot) {
      const slotDay = new Date(`${weekKeyOf(dateKeyUtc(booking.start_time))}T00:00:00Z`)
      slotDay.setUTCDate(slotDay.getUTCDate() + booking.recurring_day_of_week!)
      const start = wallClockToUtc(dateKeyUtc(slotDay), slot.lesson_time)
      const currentMinutes = Math.round(
        (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 60000,
      )
      const end = new Date(start.getTime() + (slot.duration_minutes ?? Math.max(currentMinutes, 15)) * 60000)
      patch = { status: "confirmed", start_time: start.toISOString(), end_time: end.toISOString() }
    }
  }

  const { error } = await supabase.from("bookings").update(patch).eq("id", bookingId)
  if (error) return { error: error.message }

  revalidateScheduleViews()
  return { success: true }
}
