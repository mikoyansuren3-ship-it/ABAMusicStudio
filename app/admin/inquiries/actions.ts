"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveInquiry(inquiryId: string, adminNotes: string) {
  const supabase = await createClient()

  // Get inquiry details
  const { data: inquiry } = await supabase.from("inquiries").select("*").eq("id", inquiryId).single()

  if (!inquiry) return { error: "Inquiry not found" }

  // Update inquiry status
  const { error: updateError } = await supabase
    .from("inquiries")
    .update({
      status: "approved",
      admin_notes: adminNotes,
    })
    .eq("id", inquiryId)

  if (updateError) return { error: updateError.message }

  // Note: In a real app, you would send an email to the student with instructions to create their account
  // The account creation happens when they sign up via the auth flow

  revalidatePath("/admin/inquiries")
  revalidatePath("/admin")
  return { success: true }
}

export async function denyInquiry(inquiryId: string, adminNotes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("inquiries")
    .update({
      status: "denied",
      admin_notes: adminNotes,
    })
    .eq("id", inquiryId)

  if (error) return { error: error.message }

  revalidatePath("/admin/inquiries")
  revalidatePath("/admin")
  return { success: true }
}

export async function updateInquiryNotes(inquiryId: string, adminNotes: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("inquiries").update({ admin_notes: adminNotes }).eq("id", inquiryId)

  if (error) return { error: error.message }

  revalidatePath("/admin/inquiries")
  return { success: true }
}
