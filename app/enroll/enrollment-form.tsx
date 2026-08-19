"use client"

import { useState, useTransition } from "react"

import { submitEnrollmentRequest } from "@/app/enroll/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle } from "lucide-react"
import type { Duration, Frequency } from "@/lib/stripe-prices"

const durations: Duration[] = [30, 45]
const frequencies: Frequency[] = [1, 2]

function parseDuration(value: string): Duration {
  const duration = Number(value)
  if (duration === 30 || duration === 45) return duration
  return 30
}

function parseFrequency(value: string): Frequency {
  const frequency = Number(value)
  if (frequency === 1 || frequency === 2) return frequency
  return 1
}

export function EnrollmentForm() {
  const [parentName, setParentName] = useState("")
  const [parentEmail, setParentEmail] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [studentName, setStudentName] = useState("")
  const [duration, setDuration] = useState<Duration>(30)
  const [frequency, setFrequency] = useState<Frequency>(1)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await submitEnrollmentRequest({
        parentName,
        parentEmail,
        parentPhone,
        studentName,
        duration,
        frequency,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSubmitted(true)
      }
    })
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <CheckCircle className="h-16 w-16 text-accent" />
          <h2 className="mt-6 font-serif text-2xl font-bold">Enrollment Request Sent!</h2>
          <p className="mt-4 text-muted-foreground">
            Thank you for choosing ABA Music Academy. We&apos;ll call or email you within 1-2 business days to confirm
            your plan and schedule the first lesson.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
          <CardDescription>Tell us who the lessons are for and choose a lesson plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent Name</Label>
              <Input
                id="parentName"
                required
                autoComplete="name"
                value={parentName}
                onChange={(event) => setParentName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Parent Email</Label>
              <Input
                id="parentEmail"
                type="email"
                required
                autoComplete="email"
                value={parentEmail}
                onChange={(event) => setParentEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Parent Phone</Label>
              <Input
                id="parentPhone"
                type="tel"
                autoComplete="tel"
                placeholder="(818) 555-0123"
                value={parentPhone}
                onChange={(event) => setParentPhone(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                required
                autoComplete="off"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="font-medium">Lesson Duration</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose the lesson length that best fits the student.</p>
            </div>
            <RadioGroup
              value={String(duration)}
              onValueChange={(value) => setDuration(parseDuration(value))}
              className="grid gap-3 sm:grid-cols-2"
            >
              {durations.map((option) => (
                <Label
                  key={option}
                  htmlFor={`duration-${option}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent/5"
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
              className="grid gap-3 sm:grid-cols-2"
            >
              {frequencies.map((option) => (
                <Label
                  key={option}
                  htmlFor={`frequency-${option}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent/5"
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
          <CardTitle>Request Summary</CardTitle>
          <CardDescription>We&apos;ll confirm final details when we reach out.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm" aria-live="polite">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Requested plan</span>
              <span className="font-medium">
                {duration} min, {frequency}x/week
              </span>
            </div>
          </div>

          {error && (
            <p role="alert" aria-live="polite" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Sending Request..." : "Submit Enrollment Request"}
          </Button>

          <p className="text-xs leading-relaxed text-muted-foreground">
            No payment is collected here. Our team will call or email you to confirm your plan and set up billing.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}
