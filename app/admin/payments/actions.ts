"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createInvoice(formData: FormData) {
  const supabase = await createClient()

  const studentId = formData.get("student_id") as string
  const amountDollars = Number.parseFloat(formData.get("amount") as string)
  const description = (formData.get("description") as string) || null
  const dueDate = (formData.get("due_date") as string) || null

  const { error } = await supabase.from("invoices").insert({
    student_id: studentId,
    amount: Math.round(amountDollars * 100), // Store in cents
    description,
    due_date: dueDate || null,
    status: "unpaid",
  })

  if (error) return { error: error.message }

  revalidatePath("/admin/payments")
  revalidatePath("/admin")
  return { success: true }
}

export async function markAsPaid(invoiceId: string, method: "cash" | "check") {
  const supabase = await createClient()

  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: method,
    })
    .eq("id", invoiceId)

  if (error) return { error: error.message }

  revalidatePath("/admin/payments")
  revalidatePath("/admin")
  return { success: true }
}
