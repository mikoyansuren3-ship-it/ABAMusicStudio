export type Duration = 30 | 45
export type Frequency = 1 | 2
export type SubscriptionPriceKey = `${Duration}-${Frequency}`

/** $45/lesson at 30 min, $55/lesson at 45 min; $5 off per lesson at 2x/week. Monthly = per-lesson x lessons/month (4 for 1x, 8 for 2x). */
export const SUBSCRIPTION_PRICES_USD: Record<Duration, Record<Frequency, number>> = {
  30: { 1: 180, 2: 320 },
  45: { 1: 220, 2: 400 },
}

export const REGISTRATION_FEE_USD = 35

export const SUBSCRIPTION_PRICE_LOOKUP_KEYS: Record<SubscriptionPriceKey, string> = {
  "30-1": "piano_30min_1x_monthly_v2",
  "30-2": "piano_30min_2x_monthly_v2",
  "45-1": "piano_45min_1x_monthly_v2",
  "45-2": "piano_45min_2x_monthly_v2",
}

export const REGISTRATION_FEE_LOOKUP_KEY = "registration_fee"
