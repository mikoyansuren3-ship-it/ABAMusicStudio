"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createNotification(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const body = formData.get("body") as string
  const audience = formData.get("audience") as "all" | "selected"
  const recipientIds = audience === "selected" ? JSON.parse((formData.get("recipient_ids") as string) || "[]") : null

  const { error } = await supabase.from("notifications").insert({
    title,
    body,
    audience,
    recipient_ids: recipientIds,
  })

  if (error) return { error: error.message }

  revalidatePath("/admin/notifications")
  return { success: true }
}

export async function deleteNotification(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/notifications")
  return { success: true }
}
