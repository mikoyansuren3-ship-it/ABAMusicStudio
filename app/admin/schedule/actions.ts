"use server"

import { createClient } from "@/lib/supabase/server"
import { classifySlot } from "@/lib/schedule"
import { dateKeyUtc, studioNow, wallClockToUtc } from "@/lib/studio-time"
import { revalidatePath } from "next/cache"

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
    supabase.from("students").select("teacher_id").eq("id", studentId).single(),
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

  const { error } = await supabase.from("bookings").insert({
    student_id: studentId,
    teacher_id: studentRes.data?.teacher_id ?? null,
    start_time: startDateTime.toISOString(),
    end_time: endDateTime.toISOString(),
    status: "confirmed",
  })

  if (error) return { error: error.message }

  revalidatePath("/admin/schedule")
  revalidatePath("/admin/money")
  revalidatePath("/admin")
  return { success: true }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId)

  if (error) return { error: error.message }

  revalidatePath("/admin/schedule")
  revalidatePath("/admin/money")
  revalidatePath("/admin")
  return { success: true }
}
