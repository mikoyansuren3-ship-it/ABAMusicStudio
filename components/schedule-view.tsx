"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Clock, X, RefreshCw, Loader2 } from "lucide-react"
import type { Booking, Availability, AvailabilityException } from "@/lib/types"
import { WeeklyAvailabilityCalendar } from "./weekly-availability-calendar"
import { cancelBooking, rescheduleBooking } from "@/app/portal/schedule/actions"
import { useRouter } from "next/navigation"

interface ScheduleViewProps {
  bookings: Booking[]
  availability: Availability[]
  exceptions: AvailabilityException[]
}

export function ScheduleView({ bookings, availability, exceptions }: ScheduleViewProps) {
  const router = useRouter()
  const [now] = useState(() => Date.now())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const upcomingBookings = bookings.filter((b) => new Date(b.start_time) >= new Date() && b.status !== "cancelled")
  const pastBookings = bookings.filter((b) => new Date(b.start_time) < new Date() || b.status === "completed")

  async function handleCancel() {
    if (!selectedBooking) return
    setIsLoading(true)
    setActionError(null)
    const result = await cancelBooking(selectedBooking.id)
    setIsLoading(false)
    if (result?.error) {
      setActionError(result.error)
      return
    }
    setCancelDialogOpen(false)
    setSelectedBooking(null)
    router.refresh()
  }

  async function handleReschedule() {
    if (!selectedBooking || !selectedSlot) return
    setIsLoading(true)
    setActionError(null)
    const result = await rescheduleBooking(selectedBooking.id, selectedSlot.start.toISOString(), selectedSlot.end.toISOString())
    setIsLoading(false)
    if (result?.error) {
      setActionError(result.error)
      return
    }
    setRescheduleDialogOpen(false)
    setSelectedBooking(null)
    setSelectedSlot(null)
    router.refresh()
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "confirmed":
        return <Badge>Confirmed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Lessons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Lessons
          </CardTitle>
          <CardDescription>Your scheduled lessons. Click on a lesson to manage it.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => {
                const startDate = new Date(booking.start_time)
                const endDate = new Date(booking.end_time)
                const canModify = startDate.getTime() - now > 24 * 60 * 60 * 1000

                return (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <span className="text-xs font-medium">
                          {startDate.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-bold">{startDate.getDate()}</span>
                      </div>
                      <div>
                        <p className="font-medium">{startDate.toLocaleDateString("en-US", { weekday: "long" })}</p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} -{" "}
                          {endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(booking.status)}
                      {canModify && booking.status === "confirmed" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setRescheduleDialogOpen(true)
                            }}
                          >
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Reschedule
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setCancelDialogOpen(true)
                            }}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      {!canModify && booking.status === "confirmed" && (
                        <span className="text-xs text-muted-foreground">Cannot modify within 24h</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No upcoming lessons scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Lessons */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson History</CardTitle>
            <CardDescription>Your past lessons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pastBookings.slice(0, 10).map((booking) => {
                const startDate = new Date(booking.start_time)
                const endDate = new Date(booking.end_time)

                return (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border p-3 opacity-75">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <p className="font-medium">
                          {startDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-muted-foreground">
                          {startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} -{" "}
                          {endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reschedule Lesson</DialogTitle>
            <DialogDescription>Select a new time for your lesson from the available slots below.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <WeeklyAvailabilityCalendar
              availability={availability}
              exceptions={exceptions}
              existingBookings={bookings.filter((b) => b.id !== selectedBooking?.id)}
              onSelectSlot={(start, end) => setSelectedSlot({ start, end })}
              selectedSlot={selectedSlot}
              lessonDuration={
                selectedBooking
                  ? (new Date(selectedBooking.end_time).getTime() - new Date(selectedBooking.start_time).getTime()) /
                    60000
                  : 30
              }
            />
          </div>
          {selectedSlot && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-medium">New Time:</p>
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
            </div>
          )}
          {actionError && <p className="text-sm text-destructive">{actionError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={!selectedSlot || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                "Confirm Reschedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this lesson? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="font-medium">
                {new Date(selectedBooking.start_time).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedBooking.start_time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(selectedBooking.end_time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Per our cancellation policy, lessons cancelled with at least 24 hours notice can be rescheduled at no
            charge.
          </p>
          {actionError && <p className="text-sm text-destructive">{actionError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Lesson
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Lesson"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
