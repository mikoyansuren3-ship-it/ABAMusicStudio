import { createClient } from "@/lib/supabase/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdminScheduleView } from "@/components/admin-schedule-view"

export default async function AdminSchedulePage() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, student:students(*, profile:profiles(*))")
    .gte("start_time", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("start_time")

  const { data: students } = await supabase
    .from("students")
    .select("*, profile:profiles(*)")
    .eq("is_active", true)
    .order("created_at")

  const { data: availability } = await supabase.from("availability").select("*").eq("is_active", true)

  const { data: exceptions } = await supabase
    .from("availability_exceptions")
    .select("*")
    .gte("exception_date", new Date().toISOString().split("T")[0])

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-lg font-semibold">Schedule</h1>
        </div>
      </header>

      <div className="p-6">
        <AdminScheduleView
          bookings={bookings || []}
          students={students || []}
          availability={availability || []}
          exceptions={exceptions || []}
        />
      </div>
    </>
  )
}
