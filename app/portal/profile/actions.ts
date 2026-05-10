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
  const studentName = formData.get("student_name") as string
  const experienceLevel = (formData.get("experience_level") as string) || null
  const preferredLessonDuration = Number.parseInt(formData.get("preferred_lesson_duration") as string) || 30

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
    })
    .eq("id", user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  if (studentName) {
    const studentPayload = {
      parent_id: user.id,
      name: studentName,
      experience_level: experienceLevel,
      preferred_lesson_duration: preferredLessonDuration,
      is_active: true,
    }

    const { data: existingStudent } = await supabase.from("students").select("id").eq("parent_id", user.id).maybeSingle()
    const { error: studentError } = existingStudent
      ? await supabase.from("students").update(studentPayload).eq("id", existingStudent.id)
      : await supabase.from("students").insert(studentPayload)

    if (studentError) return { error: studentError.message }
  }

  revalidatePath("/portal/profile")
  revalidatePath("/portal")
  return { success: true }
}
