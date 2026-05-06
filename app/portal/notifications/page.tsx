import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { NotificationsView } from "@/components/notifications-view"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Fetch notifications for this user
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .or(`audience.eq.all,recipient_ids.cs.{${user.id}}`)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
      </header>

      <div className="p-6">
        <NotificationsView notifications={notifications || []} userId={user.id} />
      </div>
    </>
  )
}
