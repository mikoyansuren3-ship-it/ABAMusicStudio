"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const DURATIONS = [30, 45, 60]
const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"]

function optionalText(formData: FormData, field: string) {
  return ((formData.get(field) as string) || "").trim() || null
}

/** Every field except the name may be blank. */
function parseStudentFields(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim()
  if (!name) return { error: "Enter the student's name." as const }

  const experienceRaw = (formData.get("experience_level") as string) || ""
  const durationRaw = Number.parseInt((formData.get("duration") as string) || "")

  return {
    student: {
      name,
      experience_level: EXPERIENCE_LEVELS.includes(experienceRaw) ? experienceRaw : null,
      preferred_lesson_duration: DURATIONS.includes(durationRaw) ? durationRaw : 30,
      contact_name: optionalText(formData, "contact_name"),
      contact_phone: optionalText(formData, "contact_phone"),
    },
  }
}

/**
 * Billing from the same form: rate, day, and time are each optional. Returns
 * the upsert payload, null when every billing field is blank, or an error.
 */
function parseBillingFields(formData: FormData, durationMinutes: number) {
  const rateRaw = ((formData.get("rate") as string) || "").trim()
  const dayRaw = (formData.get("day_of_week") as string) || ""
  const timeRaw = ((formData.get("lesson_time") as string) || "").trim()

  const hasDay = dayRaw !== "" && dayRaw !== "none"
  if (!rateRaw && !hasDay && !timeRaw) return { billing: null }

  const rate = rateRaw ? Number.parseFloat(rateRaw) : 0
  if (Number.isNaN(rate) || rate < 0) return { error: "Enter a valid rate." as const }

  const day = hasDay ? Number.parseInt(dayRaw) : null
  if (day !== null && (Number.isNaN(day) || day < 0 || day > 6)) {
    return { error: "Choose a valid lesson day." as const }
  }

  return {
    billing: {
      rate_cents: Math.round(rate * 100),
      day_of_week: day,
      lesson_time: timeRaw || null,
      duration_minutes: durationMinutes,
    },
  }
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient()

  const parsed = parseStudentFields(formData)
  if ("error" in parsed) return { error: parsed.error }

  const billingParsed = parseBillingFields(formData, parsed.student.preferred_lesson_duration)
  if ("error" in billingParsed) return { error: billingParsed.error }

  const { data: student, error } = await supabase
    .from("students")
    .insert({ ...parsed.student, parent_id: null })
    .select("id")
    .single()

  if (error) return { error: error.message }

  if (billingParsed.billing) {
    const { error: billingError } = await supabase
      .from("student_billing")
      .upsert({ student_id: student.id, ...billingParsed.billing })
    if (billingError) return { error: billingError.message }
  }

  revalidatePath("/admin/students")
  revalidatePath("/admin/ledger")
  return { success: true }
}

export async function updateStudent(studentId: string, formData: FormData) {
  const supabase = await createClient()

  const parsed = parseStudentFields(formData)
  if ("error" in parsed) return { error: parsed.error }

  const billingParsed = parseBillingFields(formData, parsed.student.preferred_lesson_duration)
  if ("error" in billingParsed) return { error: billingParsed.error }

  const { error } = await supabase.from("students").update(parsed.student).eq("id", studentId)
  if (error) return { error: error.message }

  if (billingParsed.billing) {
    const { error: billingError } = await supabase
      .from("student_billing")
      .upsert({ student_id: studentId, ...billingParsed.billing })
    if (billingError) return { error: billingError.message }
  } else {
    // All billing fields cleared: remove the billing record entirely.
    const { error: billingError } = await supabase.from("student_billing").delete().eq("student_id", studentId)
    if (billingError) return { error: billingError.message }
  }

  revalidatePath("/admin/students")
  revalidatePath("/admin/ledger")
  return { success: true }
}

export async function updateStudentNotes(studentId: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("students").update({ notes }).eq("id", studentId)

  if (error) return { error: error.message }

  revalidatePath("/admin/students")
  return { success: true }
}

export async function toggleStudentActive(studentId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from("students").update({ is_active: isActive }).eq("id", studentId)

  if (error) return { error: error.message }

  revalidatePath("/admin/students")
  return { success: true }
}
