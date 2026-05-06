import { createClient } from "@/lib/supabase/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdminNotificationsView } from "@/components/admin-notifications-view"

export default async function AdminNotificationsPage() {
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: students } = await supabase.from("students").select("*, profile:profiles(*)").eq("is_active", true)

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
        <AdminNotificationsView notifications={notifications || []} students={students || []} />
      </div>
    </>
  )
}
