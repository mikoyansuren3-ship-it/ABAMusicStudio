import Stripe from "stripe"
import { NextResponse, type NextRequest } from "next/server"

import { stripe } from "@/lib/stripe"

export const runtime = "nodejs"

function getStripeId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null
}

function logCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("stripe.checkout.session.completed", {
    sessionId: session.id,
    customerId: getStripeId(session.customer),
    subscriptionId: getStripeId(session.subscription),
    paymentStatus: session.payment_status,
    studentName: session.metadata?.studentName ?? null,
    duration: session.metadata?.duration ?? null,
    frequency: session.metadata?.frequency ?? null,
    isFirstTime: session.metadata?.isFirstTime ?? null,
  })
}

function logSubscriptionEvent(eventName: string, subscription: Stripe.Subscription) {
  console.log(eventName, {
    subscriptionId: subscription.id,
    customerId: getStripeId(subscription.customer),
    status: subscription.status,
    studentName: subscription.metadata?.studentName ?? null,
    duration: subscription.metadata?.duration ?? null,
    frequency: subscription.metadata?.frequency ?? null,
  })
}

function logInvoiceEvent(eventName: string, invoice: Stripe.Invoice) {
  console.log(eventName, {
    invoiceId: invoice.id,
    customerId: getStripeId(invoice.customer),
    status: invoice.status,
    amountPaid: invoice.amount_paid,
    amountDue: invoice.amount_due,
    hostedInvoiceUrl: invoice.hosted_invoice_url,
  })
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Missing Stripe webhook secret or signature" }, { status: 400 })
  }

  const rawBody = await request.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown signature verification error"
    console.error("stripe.webhook.signature_verification_failed", { message })
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed":
      logCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
      break
    case "customer.subscription.created":
      logSubscriptionEvent("stripe.customer.subscription.created", event.data.object as Stripe.Subscription)
      break
    case "customer.subscription.updated":
      logSubscriptionEvent("stripe.customer.subscription.updated", event.data.object as Stripe.Subscription)
      break
    case "customer.subscription.deleted":
      logSubscriptionEvent("stripe.customer.subscription.deleted", event.data.object as Stripe.Subscription)
      break
    case "invoice.payment_succeeded":
      logInvoiceEvent("stripe.invoice.payment_succeeded", event.data.object as Stripe.Invoice)
      break
    case "invoice.payment_failed":
      logInvoiceEvent("stripe.invoice.payment_failed", event.data.object as Stripe.Invoice)
      break
    default:
      console.log("stripe.webhook.unhandled_event", { type: event.type, eventId: event.id })
  }

  return NextResponse.json({ received: true })
}

