import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dateKeyUtc, studioNow } from "@/lib/studio-time"

export async function GET() {
  const supabase = await createClient()

  const [availabilityRes, exceptionsRes, busyRes] = await Promise.all([
    supabase.from("availability").select("*").eq("is_active", true).order("day_of_week"),
    supabase
      .from("availability_exceptions")
      .select("*")
      .gte("exception_date", dateKeyUtc(studioNow()))
      .order("exception_date"),
    // Busy slots only — see scripts/018_public_busy_times.sql. The bookings
    // table itself is no longer readable studio-wide.
    supabase.rpc("busy_lesson_times", { p_from: studioNow().toISOString() }),
  ])

  // Failing open here would draw every taken slot as free, so say so instead.
  if (busyRes.error) {
    console.error("busy_lesson_times failed:", busyRes.error)
    return NextResponse.json({ error: "Availability is temporarily unavailable." }, { status: 503 })
  }

  return NextResponse.json({
    availability: availabilityRes.data || [],
    exceptions: exceptionsRes.data || [],
    bookings: busyRes.data || [],
  })
}
