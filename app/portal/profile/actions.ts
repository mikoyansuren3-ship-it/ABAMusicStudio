"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const fullName = formData.get("full_name") as string
  const phone = formData.get("phone") as string
  const timezone = formData.get("timezone") as string
  const parentName = formData.get("parent_name") as string
  const parentEmail = formData.get("parent_email") as string
  const parentPhone = formData.get("parent_phone") as string

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      timezone,
    })
    .eq("id", user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  // Check if student record exists
  const { data: existingStudent } = await supabase.from("students").select("id").eq("profile_id", user.id).single()

  if (existingStudent) {
    // Update existing student record
    const { error: studentError } = await supabase
      .from("students")
      .update({
        parent_name: parentName || null,
        parent_email: parentEmail || null,
        parent_phone: parentPhone || null,
      })
      .eq("profile_id", user.id)

    if (studentError) {
      return { error: studentError.message }
    }
  }

  revalidatePath("/portal/profile")
  revalidatePath("/portal")
  return { success: true }
}
