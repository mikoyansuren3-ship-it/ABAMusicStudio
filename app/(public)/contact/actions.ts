"use server"

import { createClient } from "@/lib/supabase/server"

export type ContactFormState = {
  success?: boolean
  error?: string
}

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()
  const subject = (formData.get("subject") as string)?.trim()
  const message = (formData.get("message") as string)?.trim()

  if (!name || !email || !message) {
    return { error: "Please fill in your name, email, and message." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("inquiries").insert({
    name,
    email,
    message: subject ? `[${subject}] ${message}` : message,
    status: "pending",
  })

  if (error) {
    console.error("Contact form submission error:", error)
    return { error: "Something went wrong sending your message. Please try again, or email us directly." }
  }

  return { success: true }
}
