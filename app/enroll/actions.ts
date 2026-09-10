"use server"

import { createClient } from "@/lib/supabase/server"
import type { Duration, Frequency } from "@/lib/stripe-prices"

export async function submitEnrollmentRequest(input: {
  parentName: string
  parentEmail: string
  parentPhone: string
  studentName: string
  duration: Duration
  frequency: Frequency
}) {
  const supabase = await createClient()

  if (!input.parentName || !input.parentEmail || !input.studentName) {
    return { error: "Please fill in the parent name, email, and student name." }
  }

  const { error } = await supabase.from("inquiries").insert({
    name: input.studentName,
    email: input.parentEmail,
    phone: input.parentPhone || null,
    instrument: "Piano",
    preferred_lesson_duration: input.duration,
    message: `Enrollment request from ${input.parentName} (parent/guardian) — ${input.duration} min lessons, ${input.frequency}x per week.`,
    status: "pending",
  })

  if (error) {
    console.error("Enrollment request error:", error)
    return { error: "Failed to submit your enrollment request. Please try again." }
  }

  return { success: true }
}
