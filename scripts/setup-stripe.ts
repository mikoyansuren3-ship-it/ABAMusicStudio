/**
 * ABA Music Studio - Stripe catalog setup
 *
 * Creates Products and Prices for piano subscriptions, makeup lessons,
 * 5th-week add-ons, and the registration fee.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npm run setup:stripe
 *
 * Or load the key from your shell/.env tooling before running the command.
 * Verify test mode products at https://dashboard.stripe.com/test/products.
 */

import Stripe from "stripe"

import {
  REGISTRATION_FEE_LOOKUP_KEY,
  REGISTRATION_FEE_USD,
  SUBSCRIPTION_PRICE_LOOKUP_KEYS,
  SUBSCRIPTION_PRICES_USD,
  type Duration,
  type Frequency,
  type SubscriptionPriceKey,
} from "../lib/stripe-prices"

const secretKey = process.env.STRIPE_SECRET_KEY

if (!secretKey) {
  console.error("STRIPE_SECRET_KEY env var is required.")
  process.exit(1)
}

const stripe = new Stripe(secretKey, {
  apiVersion: "2025-12-15.clover",
})

const isLive = secretKey.startsWith("sk_live_")

type ProductInput = {
  id: string
  name: string
  description: string
  metadata?: Record<string, string>
}

type PriceInput = {
  productId: string
  lookupKey: string
  unitAmountCents: number
  nickname: string
  recurring?: { interval: "month" | "year" }
  metadata?: Record<string, string>
}

async function upsertProduct(input: ProductInput): Promise<Stripe.Product> {
  try {
    const existing = await stripe.products.retrieve(input.id)
    console.log(`  Product exists: ${input.name}`)
    return existing
  } catch (error) {
    const stripeError = error as { code?: string }

    if (stripeError.code !== "resource_missing") {
      throw error
    }

    const created = await stripe.products.create({
      id: input.id,
      name: input.name,
      description: input.description,
      metadata: input.metadata,
    })

    console.log(`  Created product: ${input.name}`)
    return created
  }
}

async function upsertPrice(input: PriceInput): Promise<Stripe.Price> {
  const existing = await stripe.prices.list({
    lookup_keys: [input.lookupKey],
    limit: 1,
  })

  if (existing.data.length > 0) {
    console.log(`    Price exists: ${input.lookupKey}`)
    return existing.data[0]
  }

  const created = await stripe.prices.create({
    product: input.productId,
    unit_amount: input.unitAmountCents,
    currency: "usd",
    lookup_key: input.lookupKey,
    nickname: input.nickname,
    recurring: input.recurring,
    metadata: input.metadata,
  })

  console.log(`    Created price: ${input.lookupKey} ($${(input.unitAmountCents / 100).toFixed(2)})`)
  return created
}

async function setupPianoSubscriptions() {
  const product = await upsertProduct({
    id: "aba_piano_subscription",
    name: "Piano Lessons",
    description: "Recurring monthly piano instruction.",
    metadata: { subject: "piano", type: "subscription" },
  })

  const durations = Object.keys(SUBSCRIPTION_PRICES_USD).map(Number) as Duration[]

  for (const duration of durations) {
    const frequencyPrices = SUBSCRIPTION_PRICES_USD[duration]
    const frequencies = Object.keys(frequencyPrices).map(Number) as Frequency[]

    for (const frequency of frequencies) {
      const priceKey: SubscriptionPriceKey = `${duration}-${frequency}`

      await upsertPrice({
        productId: product.id,
        lookupKey: SUBSCRIPTION_PRICE_LOOKUP_KEYS[priceKey],
        unitAmountCents: frequencyPrices[frequency] * 100,
        nickname: `Piano - ${duration} min, ${frequency}x/week`,
        recurring: { interval: "month" },
        metadata: {
          subject: "piano",
          duration_minutes: String(duration),
          frequency_per_week: String(frequency),
          type: "subscription",
        },
      })
    }
  }
}

async function setupPianoMakeup() {
  const product = await upsertProduct({
    id: "aba_piano_makeup",
    name: "Piano Makeup / Drop-In Lesson",
    description: "One-time piano lesson used for makeups or single drop-in sessions.",
    metadata: { subject: "piano", type: "makeup" },
  })

  const lessons: Array<[Duration, number]> = [
    [30, 4500],
    [45, 6750],
    [60, 9000],
  ]

  for (const [duration, cents] of lessons) {
    await upsertPrice({
      productId: product.id,
      lookupKey: `piano_makeup_${duration}min`,
      unitAmountCents: cents,
      nickname: `Piano makeup - ${duration} min`,
      metadata: {
        subject: "piano",
        duration_minutes: String(duration),
        type: "makeup",
      },
    })
  }
}

async function setupPianoFifthWeek() {
  const product = await upsertProduct({
    id: "aba_piano_fifth_week",
    name: "Piano 5th-Week Lesson",
    description: "Add-on charge for months with a 5th lesson week.",
    metadata: { subject: "piano", type: "fifth_week" },
  })

  const lessons: Array<[Duration, number]> = [
    [30, 4500],
    [45, 6750],
    [60, 9000],
  ]

  for (const [duration, cents] of lessons) {
    await upsertPrice({
      productId: product.id,
      lookupKey: `piano_fifth_week_${duration}min`,
      unitAmountCents: cents,
      nickname: `Piano 5th-week - ${duration} min`,
      metadata: {
        subject: "piano",
        duration_minutes: String(duration),
        type: "fifth_week",
      },
    })
  }
}

async function setupRegistrationFee() {
  const product = await upsertProduct({
    id: "aba_registration_fee",
    name: "Registration Fee",
    description: "One-time enrollment fee for new students.",
    metadata: { type: "fee" },
  })

  await upsertPrice({
    productId: product.id,
    lookupKey: REGISTRATION_FEE_LOOKUP_KEY,
    unitAmountCents: REGISTRATION_FEE_USD * 100,
    nickname: "Registration fee",
    metadata: { type: "registration" },
  })
}

async function main() {
  console.log("\nABA Music Studio - Stripe catalog setup")
  console.log(`Mode: ${isLive ? "LIVE" : "TEST"}\n`)

  if (isLive) {
    console.log("Live key detected. Aborting in 5 seconds - Ctrl+C to cancel.")
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  console.log("Piano subscriptions:")
  await setupPianoSubscriptions()

  console.log("\nPiano makeup / drop-in:")
  await setupPianoMakeup()

  console.log("\nPiano 5th-week add-ons:")
  await setupPianoFifthWeek()

  console.log("\nRegistration fee:")
  await setupRegistrationFee()

  console.log("\nDone. Check the dashboard:")
  console.log(`https://dashboard.stripe.com/${isLive ? "" : "test/"}products`)
}

main().catch((error) => {
  console.error("\nSetup failed:", error)
  process.exit(1)
})
