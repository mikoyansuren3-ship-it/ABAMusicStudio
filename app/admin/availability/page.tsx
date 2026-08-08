import { createClient } from "@/lib/supabase/server"
import { AvailabilityView } from "@/components/admin/availability-view"
import { compressDays, formatTimeRange, hoursLabel, summarizeAvailability } from "@/lib/admin/format"

export default async function AvailabilityPage() {
  const supabase = await createClient()

  const [availabilityRes, exceptionsRes, upcomingRes] = await Promise.all([
    supabase.from("availability").select("*").order("day_of_week").order("start_time"),
    supabase
      .from("availability_exceptions")
      .select("*")
      .gte("exception_date", new Date().toISOString().split("T")[0])
      .order("exception_date"),
    supabase
      .from("bookings")
      .select("start_time")
      .eq("status", "confirmed")
      .gte("start_time", new Date().toISOString()),
  ])

  const availability = availabilityRes.data || []
  const exceptions = exceptionsRes.data || []

  const upcomingByWeekday: Record<number, number> = {}
  for (const booking of upcomingRes.data || []) {
    const day = new Date(booking.start_time).getDay()
    upcomingByWeekday[day] = (upcomingByWeekday[day] || 0) + 1
  }

  const active = availability.filter((slot) => slot.is_active)
  const summaryInfo = summarizeAvailability(availability)
  let summary: string
  if (active.length === 0) {
    summary = "No hours set yet · the website can't offer lesson times until you add some"
  } else {
    const ranges = new Set(active.map((slot) => `${slot.start_time.slice(0, 5)}-${slot.end_time.slice(0, 5)}`))
    const uniform = ranges.size === 1
    const daysPart = uniform
      ? `${compressDays(active.map((slot) => slot.day_of_week))}, ${formatTimeRange(active[0].start_time, active[0].end_time)}`
      : `${summaryInfo.openDays.length} days a week`
    summary = `${daysPart} · ${hoursLabel(summaryInfo.hoursPerWeek)} a week bookable from the website`
  }

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <AvailabilityView
        summary={summary}
        availability={availability}
        exceptions={exceptions}
        upcomingByWeekday={upcomingByWeekday}
      />
    </div>
  )
}
