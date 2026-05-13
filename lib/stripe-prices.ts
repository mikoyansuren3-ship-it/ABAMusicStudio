export type Duration = 30 | 45 | 60
export type Frequency = 1 | 2 | 3
export type SubscriptionPriceKey = `${Duration}-${Frequency}`

export const SUBSCRIPTION_PRICES_USD: Record<Duration, Record<Frequency, number>> = {
  30: { 1: 160, 2: 305, 3: 430 },
  45: { 1: 230, 2: 440, 3: 625 },
  60: { 1: 300, 2: 570, 3: 810 },
}

export const REGISTRATION_FEE_USD = 35

export const SUBSCRIPTION_PRICE_LOOKUP_KEYS: Record<SubscriptionPriceKey, string> = {
  "30-1": "piano_30min_1x_monthly",
  "30-2": "piano_30min_2x_monthly",
  "30-3": "piano_30min_3x_monthly",
  "45-1": "piano_45min_1x_monthly",
  "45-2": "piano_45min_2x_monthly",
  "45-3": "piano_45min_3x_monthly",
  "60-1": "piano_60min_1x_monthly",
  "60-2": "piano_60min_2x_monthly",
  "60-3": "piano_60min_3x_monthly",
}

export const REGISTRATION_FEE_LOOKUP_KEY = "registration_fee"

