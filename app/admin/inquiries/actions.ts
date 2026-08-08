"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function setInquiryStatus(inquiryId: string, status: "approved" | "denied" | "waitlist", adminNotes: string) {
  const supabase = await createClient()

  const { data: inquiry } = await supabase.from("inquiries").select("id").eq("id", inquiryId).single()
  if (!inquiry) return { error: "Inquiry not found" }

  const { error } = await supabase
    .from("inquiries")
    .update({ status, admin_notes: adminNotes })
    .eq("id", inquiryId)

  if (error) return { error: error.message }

  revalidatePath("/admin/inquiries")
  revalidatePath("/admin")
  return { success: true }
}

export async function approveInquiry(inquiryId: string, adminNotes: string) {
  // Note: account creation happens when the family signs up via the auth flow.
  return setInquiryStatus(inquiryId, "approved", adminNotes)
}

export async function denyInquiry(inquiryId: string, adminNotes: string) {
  return setInquiryStatus(inquiryId, "denied", adminNotes)
}

export async function waitlistInquiry(inquiryId: string, adminNotes: string) {
  return setInquiryStatus(inquiryId, "waitlist", adminNotes)
}

export async function updateInquiryNotes(inquiryId: string, adminNotes: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("inquiries").update({ admin_notes: adminNotes }).eq("id", inquiryId)

  if (error) return { error: error.message }

  revalidatePath("/admin/inquiries")
  return { success: true }
}
