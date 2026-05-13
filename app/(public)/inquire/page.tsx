"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Loader2 } from "lucide-react"
import { submitInquiry } from "./actions"
import { WeeklyAvailabilityCalendar } from "@/components/weekly-availability-calendar"
import type { Availability, AvailabilityException, Booking } from "@/lib/types"

type BookingSlot = Pick<Booking, "start_time" | "end_time" | "status">

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
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [bookings, setBookings] = useState<BookingSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)

  useEffect(() => {
    // Fetch availability
    async function fetchAvailability() {
      try {
        const res = await fetch("/api/availability")
        if (res.ok) {
          const data = await res.json()
          setAvailability(data.availability || [])
          setExceptions(data.exceptions || [])
          setBookings(data.bookings || [])
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err)
      }
    }
    fetchAvailability()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("preferred_days", JSON.stringify(selectedDays))

    if (selectedSlot) {
      formData.set("requested_slot_start", selectedSlot.start.toISOString())
      formData.set("requested_slot_end", selectedSlot.end.toISOString())
    }

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
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl font-bold">Inquire About Lessons</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Fill out the form below and we&apos;ll help you find the perfect lesson time.
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          {/* Availability Calendar */}
          <div>
            <h2 className="mb-4 font-serif text-xl font-semibold">Available Times</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Click on an available time slot to request it, or fill out your preferences below.
            </p>
            <WeeklyAvailabilityCalendar
              availability={availability}
              exceptions={exceptions}
              existingBookings={bookings}
              onSelectSlot={(start, end) => setSelectedSlot({ start, end })}
              selectedSlot={selectedSlot}
            />
          </div>

          {/* Inquiry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Tell us about the prospective student.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Student Name *</Label>
                    <Input id="name" name="name" required placeholder="Full name" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="818-836-2322" />
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

                  <div className="space-y-2">
                    <Label htmlFor="preferred_lesson_duration">Preferred Lesson Length</Label>
                    <Select name="preferred_lesson_duration" defaultValue="30">
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
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

                  {selectedSlot && (
                    <div className="rounded-lg border bg-accent/5 p-4">
                      <p className="text-sm font-medium">Selected Time Slot:</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedSlot.start.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {selectedSlot.start.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setSelectedSlot(null)}
                      >
                        Clear selection
                      </Button>
                    </div>
                  )}

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

                {error && <p className="text-sm text-destructive">{error}</p>}

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

                <p className="text-center text-xs text-muted-foreground">
                  By submitting this form, you agree to be contacted regarding lessons at ABA Music Academy.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
