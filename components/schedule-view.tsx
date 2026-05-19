"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LessonRow } from "@/components/portal/studio/lesson-row"
import {
  PortalButton,
  PortalCard,
  PortalEmptyState,
  PortalPageBody,
  PortalPageHeader,
  SectionDivider,
} from "@/components/portal/studio/portal-ui"
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
    const result = await rescheduleBooking(
      selectedBooking.id,
      selectedSlot.start.toISOString(),
      selectedSlot.end.toISOString(),
    )
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

  return (
    <div className="flex min-h-full flex-col">
      <PortalPageHeader title="Schedule" subtitle="Your upcoming and past lessons" />

      <PortalPageBody>
        <SectionDivider clef="treble" label="Upcoming Lessons" />

        <PortalCard className="mb-7 overflow-hidden">
          {upcomingBookings.length > 0 ? (
            <div className="px-2 py-1.5">
              {upcomingBookings.map((booking, i) => {
                const canModify = new Date(booking.start_time).getTime() - now > 24 * 60 * 60 * 1000
                return (
                  <LessonRow
                    key={booking.id}
                    booking={booking}
                    isFirst={i === 0}
                    showActions
                    canModify={canModify}
                    onReschedule={() => {
                      setSelectedBooking(booking)
                      setRescheduleDialogOpen(true)
                    }}
                    onCancel={() => {
                      setSelectedBooking(booking)
                      setCancelDialogOpen(true)
                    }}
                  />
                )
              })}
            </div>
          ) : (
            <PortalEmptyState message="No upcoming lessons scheduled." />
          )}
        </PortalCard>

        {pastBookings.length > 0 ? (
          <>
            <SectionDivider clef="bass" label="Lesson History" />
            <PortalCard className="overflow-hidden">
              <div className="px-2 py-1.5">
                {pastBookings.slice(0, 15).map((booking) => (
                  <LessonRow key={booking.id} booking={booking} faded />
                ))}
              </div>
            </PortalCard>
          </>
        ) : null}
      </PortalPageBody>

      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="max-w-3xl border-[rgba(78,52,37,0.08)] bg-[#F5EFE3]">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#2b1b14]">Reschedule Lesson</DialogTitle>
            <DialogDescription className="text-[#8B7355]">
              Select a new time for your lesson from the available slots below.
            </DialogDescription>
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
          {selectedSlot ? (
            <div className="rounded-lg border border-[rgba(78,52,37,0.08)] bg-white/80 p-3">
              <p className="text-sm font-medium text-[#2b1b14]">New Time:</p>
              <p className="text-sm text-[#8B7355]">
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
          ) : null}
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          <DialogFooter>
            <PortalButton variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton variant="primary" onClick={handleReschedule} disabled={!selectedSlot || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                "Confirm Reschedule"
              )}
            </PortalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="border-[rgba(78,52,37,0.08)] bg-[#F5EFE3]">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#2b1b14]">Cancel Lesson</DialogTitle>
            <DialogDescription className="text-[#8B7355]">
              Are you sure you want to cancel this lesson? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking ? (
            <div className="rounded-lg border border-[rgba(78,52,37,0.08)] bg-white/80 p-3">
              <p className="font-medium text-[#2b1b14]">
                {new Date(selectedBooking.start_time).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-[#8B7355]">
                {new Date(selectedBooking.start_time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                –{" "}
                {new Date(selectedBooking.end_time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ) : null}
          <p className="text-sm text-[#8B7355]">
            Per our cancellation policy, lessons cancelled with at least 24 hours notice can be rescheduled at no
            charge.
          </p>
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          <DialogFooter>
            <PortalButton variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Lesson
            </PortalButton>
            <PortalButton variant="danger" onClick={handleCancel} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Lesson"
              )}
            </PortalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
