"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  AVATAR_BUCKET,
  avatarObjectPath,
  extensionForMimeType,
  validateAvatarFile,
} from "@/lib/portal/avatar"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/** Word the user must type to confirm irreversible account deletion. */
export const DELETE_CONFIRM_WORD = "DELETE"

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

export async function uploadProfileAvatar(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const file = formData.get("avatar")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image to upload." }
  }

  const validationError = validateAvatarFile(file)
  if (validationError) return { error: validationError }

  const extension = extensionForMimeType(file.type)
  const path = avatarObjectPath(user.id, extension)

  const { data: existingProfile } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).maybeSingle()

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  })

  if (uploadError) {
    return { error: uploadError.message }
  }

  if (existingProfile?.avatar_path && existingProfile.avatar_path !== path) {
    await supabase.storage.from(AVATAR_BUCKET).remove([existingProfile.avatar_path])
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath("/portal/profile")
  revalidatePath("/portal")
  return { success: true }
}

export async function removeProfileAvatar() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).maybeSingle()

  if (profile?.avatar_path) {
    await supabase.storage.from(AVATAR_BUCKET).remove([profile.avatar_path])
  }

  const { error: profileError } = await supabase.from("profiles").update({ avatar_path: null }).eq("id", user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath("/portal/profile")
  revalidatePath("/portal")
  return { success: true }
}

/**
 * Permanently deletes the signed-in member's account and personal data.
 *
 * Deleting the auth user cascades (ON DELETE CASCADE) to profiles → students →
 * bookings, invoices, and teacher_availability. Avatar storage objects and
 * email-keyed inquiries are not covered by those cascades, so they are removed
 * explicitly. Authoritative payment records remain with Stripe (retained per its
 * own policy), so this does not destroy tax/accounting history.
 *
 * On success this signs the user out and redirects; on failure it returns an error.
 */
export async function deleteMyAccount(confirmation: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You are not signed in." }

  if (confirmation !== DELETE_CONFIRM_WORD) {
    return { error: `Please type ${DELETE_CONFIRM_WORD} to confirm.` }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_path, role")
    .eq("id", user.id)
    .maybeSingle()

  // Administrator/owner accounts are not self-deletable through the member portal.
  if (profile?.role === "admin") {
    return { error: "Administrator accounts can't be deleted here. Please contact support." }
  }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return {
      error:
        "Account deletion isn't configured on the server. Email arpine@abamusicacademy.org and we'll remove your data.",
    }
  }

  // Storage objects are not removed by row cascades.
  if (profile?.avatar_path) {
    await admin.storage.from(AVATAR_BUCKET).remove([profile.avatar_path])
  }

  // Inquiries are keyed by email and not linked to the account by a foreign key.
  if (user.email) {
    await admin.from("inquiries").delete().eq("email", user.email)
  }

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    return { error: `We couldn't delete your account: ${error.message}` }
  }

  await supabase.auth.signOut({ scope: "local" })
  redirect("/?account_deleted=1")
}
