"use server"

import { createClient } from "@/lib/supabase/server"
import { isSlotBookable } from "@/lib/schedule"
import { dateKeyUtc, studioNow } from "@/lib/studio-time"
import { revalidatePath } from "next/cache"

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/portal/schedule")
  revalidatePath("/portal")
  return { success: true }
}

export async function rescheduleBooking(bookingId: string, newStartTime: string, newEndTime: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const start = new Date(newStartTime)
  const end = new Date(newEndTime)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return { error: "Invalid lesson time" }
  }

  const [availabilityRes, exceptionsRes, busyRes] = await Promise.all([
    supabase.from("availability").select("*").eq("is_active", true),
    supabase
      .from("availability_exceptions")
      .select("*")
      .gte("exception_date", dateKeyUtc(studioNow())),
    // Busy slots only — see scripts/018_public_busy_times.sql. The lesson being
    // moved is excluded so it never counts as an overlap with itself.
    supabase.rpc("busy_lesson_times", {
      p_from: studioNow().toISOString(),
      p_exclude_booking_id: bookingId,
    }),
  ])

  // An empty busy list would wave a taken slot through, so treat a failed
  // lookup as "can't confirm" rather than "free".
  if (busyRes.error) {
    console.error("busy_lesson_times failed:", busyRes.error)
    return { error: "We couldn't check that time just now. Please try again." }
  }

  const isAvailable = isSlotBookable({
    start,
    end,
    availability: availabilityRes.data || [],
    exceptions: exceptionsRes.data || [],
    existingBookings: busyRes.data || [],
  })

  if (!isAvailable) {
    return { error: "That time is no longer available. Please choose another slot." }
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      start_time: newStartTime,
      end_time: newEndTime,
      status: "pending", // Requires admin approval
    })
    .eq("id", bookingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/portal/schedule")
  revalidatePath("/portal")
  return { success: true }
}
