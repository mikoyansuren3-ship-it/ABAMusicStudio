import "server-only"
import Stripe from "stripe"

let client: Stripe | null = null

function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    client = new Stripe(key)
  }
  return client
}

/**
 * Lazily-initialized Stripe client. Deferring construction to first use keeps
 * builds and non-Stripe pages working without the secret key present.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const instance = getStripe()
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === "function" ? value.bind(instance) : value
  },
})
