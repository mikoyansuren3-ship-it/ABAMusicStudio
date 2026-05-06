"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const studentId = formData.get("student_id") as string
  const date = formData.get("date") as string
  const startTime = formData.get("start_time") as string
  const duration = Number.parseInt(formData.get("duration") as string)

  const startDateTime = new Date(`${date}T${startTime}`)
  const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

  const { error } = await supabase.from("bookings").insert({
    student_id: studentId,
    start_time: startDateTime.toISOString(),
    end_time: endDateTime.toISOString(),
    status: "confirmed",
  })

  if (error) return { error: error.message }

  revalidatePath("/admin/schedule")
  revalidatePath("/admin")
  return { success: true }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId)

  if (error) return { error: error.message }

  revalidatePath("/admin/schedule")
  revalidatePath("/admin")
  return { success: true }
}
