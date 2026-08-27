"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/public/page-header"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { submitInquiry } from "./actions"

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
]

export default function InquirePage() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!consent) {
      setError("Please agree to the Privacy Policy to submit your inquiry.")
      return
    }

    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("preferred_days", JSON.stringify(selectedDays))
    formData.set("consent", "true")

    const result = await submitInquiry(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setSubmitted(true)
      setIsLoading(false)
    }
  }

  function toggleDay(day: string) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const isConsentError = error ? /privacy policy/i.test(error) : false

  if (submitted) {
    return (
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-lg">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <CheckCircle className="h-16 w-16 text-accent" />
              <h1 className="mt-6 font-serif text-2xl font-bold">Inquiry Submitted!</h1>
              <p className="mt-4 text-muted-foreground">
                Thank you for your interest in ABA Music Academy. We&apos;ll review your inquiry and get back to you
                within 1-2 business days.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Check your email for a confirmation message.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <PageHeader
          title="Inquire About Lessons"
          lede="Fill out the form below and we'll help you find the perfect lesson time."
        />

        <div className="mx-auto mt-16 max-w-2xl space-y-12">
          {/* Warm accent — kept secondary to the form */}
          <figure className="mx-auto max-w-md">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
              <Image
                src="/students/teacher-student-after-recital.jpg"
                alt="A teacher embracing a young student holding flowers after the recital"
                width={900}
                height={675}
                sizes="(min-width: 768px) 28rem, 100vw"
                priority
                className="h-full w-full object-cover object-[center_25%]"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted-foreground">
              Every student gets their moment — and your first lesson is free.
            </figcaption>
          </figure>

          {/* Inquiry Form */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold leading-none">Student Information</h2>
              <CardDescription>Tell us about the prospective student.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Student Name *</Label>
                    <Input id="name" name="name" required autoComplete="name" placeholder="Full name" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="(818) 555-0123" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="student_age">Student Age</Label>
                      <Input id="student_age" name="student_age" type="number" min="3" max="99" placeholder="Age" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience_level">Experience Level</Label>
                      <Select name="experience_level">
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="instrument">Instrument</Label>
                      <Select name="instrument" defaultValue="Piano">
                        <SelectTrigger>
                          <SelectValue placeholder="Select instrument" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Piano">Piano</SelectItem>
                          <SelectItem value="Voice">Voice</SelectItem>
                          <SelectItem value="Violin">Violin</SelectItem>
                          <SelectItem value="Qanun">Qanun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred_lesson_duration">Preferred Lesson Length</Label>
                      <Select name="preferred_lesson_duration" defaultValue="30">
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Days</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {daysOfWeek.map((day) => (
                        <div key={day.id} className="flex items-center gap-2">
                          <Checkbox
                            id={day.id}
                            checked={selectedDays.includes(day.id)}
                            onCheckedChange={() => toggleDay(day.id)}
                          />
                          <Label htmlFor={day.id} className="text-sm font-normal">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_times">Preferred Time Range</Label>
                    <Input id="preferred_times" name="preferred_times" placeholder="e.g., Afternoons after 3pm" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Information</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Tell us about your musical goals, any previous experience, or questions you have..."
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(value) => setConsent(value === true)}
                    aria-invalid={isConsentError || undefined}
                    className="mt-0.5"
                  />
                  <Label htmlFor="consent" className="text-xs font-normal leading-relaxed text-muted-foreground">
                    I agree to the{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-2 hover:opacity-80"
                    >
                      Privacy Policy
                    </Link>{" "}
                    and consent to ABA Music Academy collecting the information I provide to respond to my inquiry and
                    contact me about lessons.
                  </Label>
                </div>

                {error && (
                  <p role="alert" aria-live="polite" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Inquiry"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
