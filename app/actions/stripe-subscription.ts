"use server"

import { stripe } from "@/lib/stripe"
import {
  REGISTRATION_FEE_LOOKUP_KEY,
  REGISTRATION_FEE_USD,
  SUBSCRIPTION_PRICE_LOOKUP_KEYS,
  type Duration,
  type Frequency,
  type SubscriptionPriceKey,
} from "@/lib/stripe-prices"

interface CreateSubscriptionCheckoutInput {
  duration: Duration
  frequency: Frequency
  isFirstTime: boolean
  parentEmail: string
  studentName: string
}

function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not configured")
  }

  return siteUrl.replace(/\/$/, "")
}

const priceIdByLookupKey = new Map<string, string>()

async function getPriceIdByLookupKey(lookupKey: string) {
  const cachedPriceId = priceIdByLookupKey.get(lookupKey)

  if (cachedPriceId) {
    return cachedPriceId
  }

  const prices = await stripe.prices.list({
    active: true,
    lookup_keys: [lookupKey],
    limit: 1,
  })

  const priceId = prices.data[0]?.id

  if (!priceId) {
    throw new Error(`No active Stripe price found for "${lookupKey}". Run npm run setup:stripe first.`)
  }

  priceIdByLookupKey.set(lookupKey, priceId)
  return priceId
}

export async function createSubscriptionCheckout({
  duration,
  frequency,
  isFirstTime,
  parentEmail,
  studentName,
}: CreateSubscriptionCheckoutInput) {
  const priceKey: SubscriptionPriceKey = `${duration}-${frequency}`
  const subscriptionPriceId = await getPriceIdByLookupKey(SUBSCRIPTION_PRICE_LOOKUP_KEYS[priceKey])
  const registrationFeePriceId =
    isFirstTime && REGISTRATION_FEE_USD > 0 ? await getPriceIdByLookupKey(REGISTRATION_FEE_LOOKUP_KEY) : null
  const siteUrl = getSiteUrl()

  const lineItems = [
    {
      price: subscriptionPriceId,
      quantity: 1,
    },
    ...(registrationFeePriceId
      ? [
          {
            price: registrationFeePriceId,
            quantity: 1,
          },
        ]
      : []),
  ]

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: parentEmail,
    line_items: lineItems,
    metadata: {
      studentName,
      duration: String(duration),
      frequency: String(frequency),
      isFirstTime: String(isFirstTime),
    },
    subscription_data: {
      metadata: {
        studentName,
        duration: String(duration),
        frequency: String(frequency),
      },
    },
    success_url: `${siteUrl}/enroll/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/enroll`,
  })

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL")
  }

  return session.url
}

