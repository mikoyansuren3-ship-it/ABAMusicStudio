import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NotificationsView } from "@/components/notifications-view"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/student/login")

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .or(`audience.eq.all,recipient_ids.cs.{${user.id}}`)
    .order("created_at", { ascending: false })
    .limit(50)

  return <NotificationsView notifications={notifications || []} userId={user.id} />
}
