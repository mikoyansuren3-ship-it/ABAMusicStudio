"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { type AuthRole, roleDestinations, roleLabels } from "@/lib/auth/roles"
import { headers } from "next/headers"

export interface AuthActionState {
  error?: string
  success?: boolean
  redirectTo?: string
  message?: string
}

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function getOwnerAdminEmail() {
  return process.env.OWNER_ADMIN_EMAIL?.trim().toLowerCase()
}

async function promoteOwnerIfNeeded(userId: string, email?: string | null) {
  const ownerEmail = getOwnerAdminEmail()
  if (!ownerEmail || email?.toLowerCase() !== ownerEmail) {
    return
  }

  const admin = createAdminClient()
  const { error } = await admin.from("profiles").upsert({ id: userId, role: "admin" }, { onConflict: "id" })

  if (error) {
    throw new Error(`Unable to promote owner account: ${error.message}`)
  }
}

async function getSiteOrigin() {
  const headerStore = await headers()
  const origin = headerStore.get("origin")
  if (origin) return origin

  const host = headerStore.get("host")
  const protocol = headerStore.get("x-forwarded-proto") || "http"
  return host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}

export async function loginWithRole(
  expectedRole: AuthRole,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getStringValue(formData, "email")
  const password = getStringValue(formData, "password")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  try {
    await promoteOwnerIfNeeded(data.user.id, data.user.email)
  } catch (error) {
    await supabase.auth.signOut()
    return { error: error instanceof Error ? error.message : "Unable to verify administrator access." }
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle()

  if (profileError) {
    await supabase.auth.signOut()
    return { error: profileError.message }
  }

  const actualRole = profile?.role || "student"
  const ownerEmail = getOwnerAdminEmail()
  const isOwner = Boolean(ownerEmail && data.user.email?.toLowerCase() === ownerEmail)

  if (expectedRole === "admin" && isOwner && actualRole !== "admin") {
    return { error: "Administrator access is still being prepared. Please try again." }
  }

  if (actualRole !== expectedRole) {
    await supabase.auth.signOut()
    return { error: `This is a ${roleLabels[actualRole as AuthRole] || actualRole} account. Please use the correct login option.` }
  }

  return { success: true, redirectTo: roleDestinations[expectedRole] }
}

export async function signUpTeacher(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const fullName = getStringValue(formData, "full_name")
  const email = getStringValue(formData, "email")
  const password = getStringValue(formData, "password")
  const confirmPassword = getStringValue(formData, "confirm_password")
  const teacherCode = getStringValue(formData, "teacher_code")
  const configuredTeacherCode = process.env.TEACHER_SIGNUP_CODE

  if (!configuredTeacherCode) {
    return { error: "Teacher signup is not configured yet." }
  }

  if (teacherCode !== configuredTeacherCode) {
    return { error: "The teacher access code is incorrect." }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." }
  }

  const supabase = await createClient()
  const origin = await getSiteOrigin()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    try {
      const admin = createAdminClient()
      const { error: profileError } = await admin
        .from("profiles")
        .upsert({ id: data.user.id, role: "teacher", full_name: fullName || null }, { onConflict: "id" })

      if (profileError) {
        return { error: profileError.message }
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to create teacher profile." }
    }
  }

  return { success: true, message: `We sent a confirmation link to ${email}. Open it to finish setting up your teacher account.` }
}
