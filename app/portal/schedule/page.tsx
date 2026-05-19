import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ScheduleView } from "@/components/schedule-view"

export default async function SchedulePage() {
  const supabase = await createClient()
  const bookingCutoff = new Date()
  bookingCutoff.setDate(bookingCutoff.getDate() - 30)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/student/login")

  const { data: student } = await supabase.from("students").select("*").eq("parent_id", user.id).maybeSingle()

  const { data: bookings } = student
    ? await supabase
        .from("bookings")
        .select("*")
        .eq("student_id", student.id)
        .gte("start_time", bookingCutoff.toISOString())
        .order("start_time")
    : { data: [] }

  const { data: availability } = await supabase.from("availability").select("*").eq("is_active", true)

  const { data: exceptions } = await supabase
    .from("availability_exceptions")
    .select("*")
    .gte("exception_date", new Date().toISOString().split("T")[0])

  return (
    <ScheduleView bookings={bookings || []} availability={availability || []} exceptions={exceptions || []} />
  )
}
