"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

function revalidateTeacherViews() {
  revalidatePath("/admin/teachers")
  revalidatePath("/admin/students")
  revalidatePath("/admin/schedule")
  revalidatePath("/admin/money")
  revalidatePath("/admin")
}

function parseTeacherFields(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim()
  if (!name) return { error: "Enter the teacher's name." as const }

  const instrument = ((formData.get("instrument") as string) || "").trim() || null
  const notes = ((formData.get("notes") as string) || "").trim() || null

  const hourlyRaw = ((formData.get("pay_hourly") as string) || "").trim()
  const hourly = hourlyRaw ? Number.parseFloat(hourlyRaw) : 0
  if (Number.isNaN(hourly) || hourly < 0) return { error: "Enter a valid hourly pay rate." as const }

  return {
    teacher: {
      name,
      instrument,
      notes,
      pay_hourly_cents: Math.round(hourly * 100),
    },
  }
}

export async function createTeacher(formData: FormData) {
  const supabase = await createClient()

  const parsed = parseTeacherFields(formData)
  if ("error" in parsed) return { error: parsed.error }

  const { error } = await supabase.from("teachers").insert(parsed.teacher)
  if (error) return { error: error.message }

  revalidateTeacherViews()
  return { success: true }
}

export async function updateTeacher(teacherId: string, formData: FormData) {
  const supabase = await createClient()

  const parsed = parseTeacherFields(formData)
  if ("error" in parsed) return { error: parsed.error }

  const { error } = await supabase.from("teachers").update(parsed.teacher).eq("id", teacherId)
  if (error) return { error: error.message }

  revalidateTeacherViews()
  return { success: true }
}

export async function toggleTeacherActive(teacherId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from("teachers").update({ is_active: isActive }).eq("id", teacherId)
  if (error) return { error: error.message }

  revalidateTeacherViews()
  return { success: true }
}
