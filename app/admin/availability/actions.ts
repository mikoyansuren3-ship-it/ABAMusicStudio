"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

function revalidateAvailabilityViews() {
  revalidatePath("/admin/availability")
  revalidatePath("/admin/schedule")
  revalidatePath("/admin")
}

export async function updateAvailability(id: string, updates: Record<string, unknown>) {
  const supabase = await createClient()

  const { error } = await supabase.from("availability").update(updates).eq("id", id)

  if (error) return { error: error.message }

  revalidateAvailabilityViews()
  return { success: true }
}

export async function addAvailability(formData: FormData) {
  const supabase = await createClient()

  const dayOfWeek = Number.parseInt(formData.get("day_of_week") as string)
  const startTime = formData.get("start_time") as string
  const endTime = formData.get("end_time") as string

  const { error } = await supabase.from("availability").insert({
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    is_active: true,
  })

  if (error) return { error: error.message }

  revalidateAvailabilityViews()
  return { success: true }
}

export async function deleteAvailability(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("availability").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidateAvailabilityViews()
  return { success: true }
}

export async function addException(formData: FormData) {
  const supabase = await createClient()

  const exceptionDate = formData.get("exception_date") as string
  const reason = (formData.get("reason") as string) || null
  const isAvailable = formData.get("is_available") === "on"
  const startTime = ((formData.get("start_time") as string) || "").trim() || "09:00"
  const endTime = ((formData.get("end_time") as string) || "").trim() || "17:00"

  const { error } = await supabase.from("availability_exceptions").insert({
    exception_date: exceptionDate,
    reason,
    is_available: isAvailable,
    start_time: isAvailable ? startTime : null,
    end_time: isAvailable ? endTime : null,
  })

  if (error) return { error: error.message }

  revalidateAvailabilityViews()
  return { success: true }
}

export async function deleteException(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("availability_exceptions").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidateAvailabilityViews()
  return { success: true }
}
