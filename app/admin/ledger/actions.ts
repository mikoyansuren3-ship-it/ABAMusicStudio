"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function setAttendance(bookingId: string, attendance: "on_time" | "missed" | null) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("bookings")
    .update({
      attendance,
      attendance_marked_at: attendance ? new Date().toISOString() : null,
      made_up_on: null,
    })
    .eq("id", bookingId)

  if (error) return { error: error.message }

  revalidatePath("/admin/ledger")
  revalidatePath("/admin")
  return { success: true }
}

export async function setMadeUp(bookingId: string, madeUpOn: string | null) {
  const supabase = await createClient()

  if (madeUpOn !== null) {
    const parsed = new Date(`${madeUpOn}T00:00:00`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(madeUpOn) || Number.isNaN(parsed.getTime())) {
      return { error: "Choose a valid make-up date." }
    }
  }

  const { error } = await supabase
    .from("bookings")
    .update({ made_up_on: madeUpOn })
    .eq("id", bookingId)
    .eq("attendance", "missed")

  if (error) return { error: error.message }

  revalidatePath("/admin/ledger")
  revalidatePath("/admin")
  return { success: true }
}

export async function saveStudentBilling(studentId: string, formData: FormData) {
  const supabase = await createClient()

  const rateDollars = Number.parseFloat(formData.get("rate") as string)
  const dayRaw = (formData.get("day_of_week") as string) || ""
  const lessonTime = ((formData.get("lesson_time") as string) || "").trim() || null
  const duration = Number.parseInt(formData.get("duration") as string)

  if (Number.isNaN(rateDollars) || rateDollars < 0) return { error: "Enter a valid rate." }
  const dayOfWeek = dayRaw && dayRaw !== "none" ? Number.parseInt(dayRaw) : null
  if (dayOfWeek !== null && (Number.isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6)) {
    return { error: "Choose a valid lesson day." }
  }
  if (![30, 45, 60].includes(duration)) return { error: "Choose a valid duration." }

  const { error } = await supabase.from("student_billing").upsert({
    student_id: studentId,
    rate_cents: Math.round(rateDollars * 100),
    day_of_week: dayOfWeek,
    lesson_time: lessonTime,
    duration_minutes: duration,
  })

  if (error) return { error: error.message }

  revalidatePath("/admin/ledger")
  return { success: true }
}
