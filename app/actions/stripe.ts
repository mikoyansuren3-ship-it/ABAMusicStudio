"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCheckoutSession(invoiceId: string) {
  const supabase = await createClient()

  // Get the invoice with student info
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      student:students(
        id,
        name,
        parent_id
      )
    `
    )
    .eq("id", invoiceId)
    .single()

  if (error || !invoice) {
    throw new Error("Invoice not found")
  }

  if (invoice.status === "paid") {
    throw new Error("Invoice is already paid")
  }

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: invoice.description || `Piano Lesson Invoice`,
            description: `Invoice for ${invoice.student?.name || "Student"}`,
          },
          unit_amount: invoice.amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      invoice_id: invoiceId,
      student_id: invoice.student_id,
    },
  })

  if (!session.client_secret) {
    throw new Error("Stripe did not return a checkout client secret")
  }

  return session.client_secret
}

export async function handlePaymentSuccess(invoiceId: string, paymentIntentId: string) {
  const supabase = await createClient()

  // Update invoice status
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("id", invoiceId)

  if (error) {
    console.error("Error updating invoice:", error)
    throw new Error("Failed to update invoice status")
  }

  revalidatePath("/portal/payments")
  revalidatePath("/admin/payments")

  return { success: true }
}

export async function verifyPaymentAndUpdateInvoice(sessionId: string) {
  // Retrieve the session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== "paid") {
    return { success: false, error: "Payment not completed" }
  }

  const invoiceId = session.metadata?.invoice_id
  if (!invoiceId) {
    return { success: false, error: "Invoice ID not found in session" }
  }

  const supabase = await createClient()

  // Update invoice status
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq("id", invoiceId)

  if (error) {
    console.error("Error updating invoice:", error)
    return { success: false, error: "Failed to update invoice" }
  }

  revalidatePath("/portal/payments")
  revalidatePath("/admin/payments")

  return { success: true, invoiceId }
}
