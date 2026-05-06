import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const [availabilityRes, exceptionsRes, bookingsRes] = await Promise.all([
    supabase.from("availability").select("*").eq("is_active", true).order("day_of_week"),
    supabase
      .from("availability_exceptions")
      .select("*")
      .gte("exception_date", new Date().toISOString().split("T")[0])
      .order("exception_date"),
    supabase
      .from("bookings")
      .select("start_time,end_time,status")
      .gte("start_time", new Date().toISOString())
      .in("status", ["confirmed", "pending"]),
  ])

  return NextResponse.json({
    availability: availabilityRes.data || [],
    exceptions: exceptionsRes.data || [],
    bookings: bookingsRes.data || [],
  })
}
