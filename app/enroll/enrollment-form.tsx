"use client"

import { useState, useTransition } from "react"

import { createSubscriptionCheckout } from "@/app/actions/stripe-subscription"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { REGISTRATION_FEE_USD, SUBSCRIPTION_PRICES_USD, type Duration, type Frequency } from "@/lib/stripe-prices"

const durations: Duration[] = [30, 45, 60]
const frequencies: Frequency[] = [1, 2, 3]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function parseDuration(value: string): Duration {
  const duration = Number(value)
  if (duration === 30 || duration === 45 || duration === 60) return duration
  return 30
}

function parseFrequency(value: string): Frequency {
  const frequency = Number(value)
  if (frequency === 1 || frequency === 2 || frequency === 3) return frequency
  return 1
}

export function EnrollmentForm() {
  const [parentName, setParentName] = useState("")
  const [parentEmail, setParentEmail] = useState("")
  const [studentName, setStudentName] = useState("")
  const [duration, setDuration] = useState<Duration>(30)
  const [frequency, setFrequency] = useState<Frequency>(1)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const monthlyPrice = SUBSCRIPTION_PRICES_USD[duration][frequency]
  const firstCheckoutTotal = monthlyPrice + REGISTRATION_FEE_USD

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const checkoutUrl = await createSubscriptionCheckout({
          duration,
          frequency,
          isFirstTime: true,
          parentEmail,
          studentName,
        })

        window.location.href = checkoutUrl
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to start checkout. Please try again.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
          <CardDescription>Tell us who the lessons are for and choose a monthly plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent Name</Label>
              <Input id="parentName" required value={parentName} onChange={(event) => setParentName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Parent Email</Label>
              <Input
                id="parentEmail"
                type="email"
                required
                value={parentEmail}
                onChange={(event) => setParentEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name</Label>
            <Input id="studentName" required value={studentName} onChange={(event) => setStudentName(event.target.value)} />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="font-medium">Lesson Duration</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose the lesson length that best fits the student.</p>
            </div>
            <RadioGroup
              value={String(duration)}
              onValueChange={(value) => setDuration(parseDuration(value))}
              className="grid gap-3 sm:grid-cols-3"
            >
              {durations.map((option) => (
                <Label
                  key={option}
                  htmlFor={`duration-${option}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <RadioGroupItem id={`duration-${option}`} value={String(option)} />
                  <span>{option} minutes</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="font-medium">Weekly Frequency</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pick how many lessons the student will attend each week.</p>
            </div>
            <RadioGroup
              value={String(frequency)}
              onValueChange={(value) => setFrequency(parseFrequency(value))}
              className="grid gap-3 sm:grid-cols-3"
            >
              {frequencies.map((option) => (
                <Label
                  key={option}
                  htmlFor={`frequency-${option}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <RadioGroupItem id={`frequency-${option}`} value={String(option)} />
                  <span>{option}x per week</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Payment Preview</CardTitle>
          <CardDescription>Registration is included in the first checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {duration} min, {frequency}x/week
              </span>
              <span className="font-medium">{formatCurrency(monthlyPrice)}/mo</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">One-time registration fee</span>
              <span className="font-medium">{formatCurrency(REGISTRATION_FEE_USD)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t pt-3 text-base">
              <span className="font-medium">Due today</span>
              <span className="font-bold">{formatCurrency(firstCheckoutTotal)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Preparing Checkout..." : "Continue to Payment"}
          </Button>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Monthly tuition renews automatically through Stripe. You can update payment details through the billing portal.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}

