import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ScheduleView } from "@/components/schedule-view"

export default async function SchedulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: student } = await supabase.from("students").select("*").eq("profile_id", user.id).single()

  // Fetch bookings for this student
  const { data: bookings } = student
    ? await supabase
        .from("bookings")
        .select("*")
        .eq("student_id", student.id)
        .gte("start_time", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order("start_time")
    : { data: [] }

  // Fetch availability for rescheduling
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
        <ScheduleView
          bookings={bookings || []}
          availability={availability || []}
          exceptions={exceptions || []}
          studentId={student?.id}
        />
      </div>
    </>
  )
}
