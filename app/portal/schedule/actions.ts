"use server"

import { createClient } from "@/lib/supabase/server"
import { isSlotBookable } from "@/lib/schedule"
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

  const [availabilityRes, exceptionsRes, bookingsRes] = await Promise.all([
    supabase.from("availability").select("*").eq("is_active", true),
    supabase
      .from("availability_exceptions")
      .select("*")
      .gte("exception_date", new Date().toISOString().split("T")[0]),
    supabase
      .from("bookings")
      .select("id,start_time,end_time,status")
      .neq("id", bookingId)
      .gte("start_time", new Date().toISOString())
      .in("status", ["confirmed", "pending"]),
  ])

  const isAvailable = isSlotBookable({
    start,
    end,
    availability: availabilityRes.data || [],
    exceptions: exceptionsRes.data || [],
    existingBookings: bookingsRes.data || [],
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
