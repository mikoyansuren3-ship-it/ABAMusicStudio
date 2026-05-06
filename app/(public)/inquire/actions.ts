"use server"

import { createClient } from "@/lib/supabase/server"

export async function submitInquiry(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = (formData.get("phone") as string) || null
  const studentAge = formData.get("student_age") ? Number.parseInt(formData.get("student_age") as string) : null
  const experienceLevel = (formData.get("experience_level") as string) || null
  const preferredLessonDuration = Number.parseInt(formData.get("preferred_lesson_duration") as string) || 30
  const preferredDays = JSON.parse((formData.get("preferred_days") as string) || "[]")
  const preferredTimes = (formData.get("preferred_times") as string) || null
  const requestedSlotStart = (formData.get("requested_slot_start") as string) || null
  const requestedSlotEnd = (formData.get("requested_slot_end") as string) || null
  const message = (formData.get("message") as string) || null

  if (!name || !email) {
    return { error: "Name and email are required." }
  }

  const { error } = await supabase.from("inquiries").insert({
    name,
    email,
    phone,
    student_age: studentAge,
    experience_level: experienceLevel,
    preferred_lesson_duration: preferredLessonDuration,
    preferred_days: preferredDays,
    preferred_times: preferredTimes,
    requested_slot_start: requestedSlotStart,
    requested_slot_end: requestedSlotEnd,
    message,
    status: "pending",
  })

  if (error) {
    console.error("Inquiry submission error:", error)
    return { error: "Failed to submit inquiry. Please try again." }
  }

  return { success: true }
}
