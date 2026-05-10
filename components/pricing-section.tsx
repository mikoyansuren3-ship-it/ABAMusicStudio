"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const BASE_MONTHLY = { 30: 180, 45: 270, 60: 360 } as const
const FREQUENCY_MULTIPLIER = { 1: 1.0, 2: 0.95, 3: 0.9 } as const
const ROUNDED_MONTHLY = {
  30: { 1: 180, 2: 340, 3: 480 },
  45: { 1: 270, 2: 510, 3: 730 },
  60: { 1: 360, 2: 670, 3: 960 },
} as const

type Duration = keyof typeof BASE_MONTHLY
type Frequency = keyof typeof FREQUENCY_MULTIPLIER

const durations: Array<{
  duration: Duration
  title: string
  description: string
  popular?: boolean
}> = [
  {
    duration: 30,
    title: "30 Minutes",
    description: "A focused pace for young beginners and foundation building.",
  },
  {
    duration: 45,
    title: "45 Minutes",
    description: "A balanced lesson length for most growing piano students.",
    popular: true,
  },
  {
    duration: 60,
    title: "60 Minutes",
    description: "Extended study for advanced students, adults, and performance prep.",
  },
]

const frequencies: Frequency[] = [1, 2, 3]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)
}

function getSavingsLabel(frequency: Frequency) {
  if (frequency === 2) return "Save 5%"
  if (frequency === 3) return "Save 10%"
  return null
}

function getMonthlyPrice(duration: Duration, frequency: Frequency) {
  const formulaMonthly = BASE_MONTHLY[duration] * frequency * FREQUENCY_MULTIPLIER[frequency]

  return ROUNDED_MONTHLY[duration][frequency] || Math.round(formulaMonthly)
}

export function PricingSection() {
  const [selectedFrequency, setSelectedFrequency] = useState<Record<Duration, Frequency>>({
    30: 1,
    45: 1,
    60: 1,
  })

  return (
    <section aria-labelledby="piano-pricing-heading">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="piano-pricing-heading" className="font-serif text-4xl font-bold">
          Piano Lesson Pricing
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Private one-on-one instruction. The more you practice with us, the more you save.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {durations.map((option) => {
          const frequency = selectedFrequency[option.duration]
          const monthlyPrice = getMonthlyPrice(option.duration, frequency)
          const standardMonthly = BASE_MONTHLY[option.duration] * frequency
          const perLesson = monthlyPrice / (frequency * 4)
          const savings = standardMonthly - monthlyPrice
          const savingsLabel = getSavingsLabel(frequency)

          return (
            <Card key={option.duration} className={option.popular ? "border-accent shadow-lg" : ""}>
              <CardHeader>
                {option.popular && <Badge className="mb-2 w-fit bg-accent text-accent-foreground">Most Popular</Badge>}
                <CardTitle>{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  role="radiogroup"
                  aria-label={`${option.duration}-minute lesson frequency`}
                  className="grid grid-cols-3 rounded-lg bg-muted p-1"
                >
                  {frequencies.map((frequencyOption) => {
                    const isSelected = frequencyOption === frequency

                    return (
                      <button
                        key={frequencyOption}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() =>
                          setSelectedFrequency((current) => ({
                            ...current,
                            [option.duration]: frequencyOption,
                          }))
                        }
                        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          isSelected ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {frequencyOption}x
                      </button>
                    )
                  })}
                </div>

                <div aria-live="polite" className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold">{formatCurrency(monthlyPrice)}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  {savingsLabel && (
                    <Badge variant="secondary" className="rounded-full">
                      {savingsLabel}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(perLesson)} per lesson, based on {frequency * 4} lessons per month
                  </p>
                  {savings > 0 && <p className="text-sm font-medium text-accent">Save {formatCurrency(savings)} monthly</p>}
                </div>

                <Button className="w-full" asChild>
                  <Link href="/inquire">Book a Free Trial</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted-foreground">
        Pricing based on 4 lessons per month. A registration fee may apply. Months with a 5th lesson week are billed
        accordingly.
      </p>
    </section>
  )
}
