"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { renderInvoiceEmail } from "@/lib/email/invoice-email"
import { revalidatePath } from "next/cache"

function revalidateMoneyViews() {
  revalidatePath("/admin/money")
  revalidatePath("/admin")
}

interface InvoiceStudent {
  id: string
  name: string
  parent_id: string | null
  contact_name: string | null
  contact_email: string | null
  profile: { full_name: string | null } | null
}

/** Where the invoice email goes: admin-entered guardian email first, then the parent portal account's email. */
async function resolveInvoiceRecipient(student: InvoiceStudent): Promise<string | null> {
  if (student.contact_email) return student.contact_email
  if (!student.parent_id) return null
  try {
    const admin = createAdminClient()
    const { data } = await admin.auth.admin.getUserById(student.parent_id)
    return data.user?.email ?? null
  } catch {
    // Service-role key not configured in this environment.
    return null
  }
}

/**
 * Send (or resend) an invoice to the family. Returns the address it went to.
 * Explicitly admin-gated: email sending is an external side effect that RLS
 * alone doesn't cover.
 */
async function sendInvoiceEmailInternal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoiceId: string,
): Promise<{ sentTo: string } | { error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "admin") return { error: "Only the admin can email invoices." }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, student:students(id, name, parent_id, contact_name, contact_email, profile:profiles(full_name))")
    .eq("id", invoiceId)
    .maybeSingle()
  if (!invoice) return { error: "Invoice not found." }
  if (invoice.status === "paid") return { error: "This invoice is already paid — nothing to send." }
  if (invoice.status === "cancelled") return { error: "This invoice was cancelled." }

  const student = invoice.student as InvoiceStudent | null
  if (!student) return { error: "Invoice has no student attached." }

  const recipient = await resolveInvoiceRecipient(student)
  if (!recipient) {
    return {
      error: `No email on file for ${student.name}'s family — add a guardian email in the student's details, then send again.`,
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return { error: "Email isn't configured yet (RESEND_API_KEY is missing), so the invoice wasn't sent." }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const { subject, html, text } = renderInvoiceEmail({
    guardianName: student.profile?.full_name || student.contact_name,
    studentName: student.name,
    amountCents: invoice.amount,
    description: invoice.description,
    dueDate: invoice.due_date,
    payUrl: student.parent_id ? `${siteUrl}/portal/pay/${invoice.id}` : null,
  })

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ABA Music Academy <noreply@abamusicacademy.org>",
      to: recipient,
      subject,
      html,
      text,
    }),
  })
  if (!response.ok) {
    return { error: "The email provider rejected the message — the invoice was saved but not sent." }
  }

  await supabase
    .from("invoices")
    .update({ sent_at: new Date().toISOString(), sent_to: recipient })
    .eq("id", invoiceId)

  return { sentTo: recipient }
}

export async function sendInvoiceEmail(invoiceId: string) {
  const supabase = await createClient()
  const result = await sendInvoiceEmailInternal(supabase, invoiceId)
  if ("error" in result) return { error: result.error }

  revalidateMoneyViews()
  return { success: true, sentTo: result.sentTo }
}

export async function createInvoice(formData: FormData) {
  const supabase = await createClient()

  const studentId = formData.get("student_id") as string
  const amountDollars = Number.parseFloat(formData.get("amount") as string)
  const description = (formData.get("description") as string) || null
  const dueDate = (formData.get("due_date") as string) || null
  const sendToParent = formData.get("send_email") === "1"

  if (!studentId) return { error: "Choose a student." }
  if (Number.isNaN(amountDollars) || amountDollars <= 0) return { error: "Enter a valid amount." }

  const { data: created, error } = await supabase
    .from("invoices")
    .insert({
      student_id: studentId,
      amount: Math.round(amountDollars * 100), // Store in cents
      description,
      due_date: dueDate || null,
      status: "unpaid",
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  let sentTo: string | null = null
  let emailWarning: string | null = null
  if (sendToParent) {
    const sendResult = await sendInvoiceEmailInternal(supabase, created.id)
    if ("error" in sendResult) emailWarning = sendResult.error
    else sentTo = sendResult.sentTo
  }

  revalidateMoneyViews()
  return { success: true, sentTo, emailWarning }
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

  revalidateMoneyViews()
  return { success: true }
}

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

  revalidateMoneyViews()
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

  revalidateMoneyViews()
  return { success: true }
}
