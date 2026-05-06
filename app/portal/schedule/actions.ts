"use server"

import { createClient } from "@/lib/supabase/server"
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
