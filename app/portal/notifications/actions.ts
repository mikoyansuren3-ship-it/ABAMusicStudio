"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const supabase = await createClient()

  // Get current notification
  const { data: notification } = await supabase
    .from("notifications")
    .select("is_read_by")
    .eq("id", notificationId)
    .single()

  if (!notification) return { error: "Notification not found" }

  const currentReadBy = notification.is_read_by || []
  if (currentReadBy.includes(userId)) return { success: true }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read_by: [...currentReadBy, userId] })
    .eq("id", notificationId)

  if (error) return { error: error.message }

  revalidatePath("/portal/notifications")
  revalidatePath("/portal")
  return { success: true }
}

export async function markAllAsRead(notificationIds: string[], userId: string) {
  const supabase = await createClient()

  for (const id of notificationIds) {
    const { data: notification } = await supabase.from("notifications").select("is_read_by").eq("id", id).single()

    if (notification) {
      const currentReadBy = notification.is_read_by || []
      if (!currentReadBy.includes(userId)) {
        await supabase
          .from("notifications")
          .update({ is_read_by: [...currentReadBy, userId] })
          .eq("id", id)
      }
    }
  }

  revalidatePath("/portal/notifications")
  revalidatePath("/portal")
  return { success: true }
}
