"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type AttendanceMark = "on_time" | "missed" | null

/**
 * Mark (or clear) attendance on one lesson.
 *
 * The write runs as the signed-in teacher, so the guard rails are the database's:
 * the UPDATE policy limits the row set to lessons stamped with this teacher, and
 * the 017 trigger limits the columns to the attendance ones. Passing a lesson
 * that isn't theirs simply matches nothing.
 */
export async function markAttendance(bookingId: string, attendance: AttendanceMark) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("bookings")
    .update({
      attendance,
      attendance_marked_at: attendance ? new Date().toISOString() : null,
      // Clearing or re-marking retires any make-up recorded against the old mark.
      made_up_on: null,
    })
    .eq("id", bookingId)
    .select("id")

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: "That lesson isn't one of yours." }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/schedule")
  revalidatePath("/dashboard/students")
  return { success: true }
}
