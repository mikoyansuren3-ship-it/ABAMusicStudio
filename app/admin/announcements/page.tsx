import { createClient } from "@/lib/supabase/server"
import { AnnouncementsView } from "@/components/admin/announcements-view"

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient()

  const [{ data: announcements }, { data: students }] = await Promise.all([
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    supabase.from("students").select("*, profile:profiles(*)").eq("is_active", true).order("name"),
  ])

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <AnnouncementsView announcements={announcements || []} students={students || []} />
    </div>
  )
}
