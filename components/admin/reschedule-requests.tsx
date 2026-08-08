"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Loader2, X } from "lucide-react"
import { updateBookingStatus } from "@/app/admin/schedule/actions"
import { formatDateTime, formatTime } from "@/lib/portal/format"
import type { Booking, Student } from "@/lib/types"

interface RescheduleRequestsProps {
  requests: (Booking & { student: Student | null })[]
}

/** Pending bookings awaiting an approve / decline from the admin. */
export function RescheduleRequests({ requests }: RescheduleRequestsProps) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function decide(bookingId: string, status: "confirmed" | "cancelled") {
    setPendingId(bookingId)
    setActionError(null)
    const result = await updateBookingStatus(bookingId, status)
    if (result?.error) setActionError(result.error)
    router.refresh()
    setPendingId(null)
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="font-serif text-[19px] font-semibold">None to approve</p>
        <p className="text-[13px] text-muted-foreground">
          When a parent asks to move a lesson, it waits here for your yes or no.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {actionError && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {actionError}
        </p>
      )}
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-[15px] font-semibold">{request.student?.name || "Student"}</p>
            <p className="text-[13px] text-muted-foreground">
              {formatDateTime(request.start_time)} – {formatTime(request.end_time)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-lg"
              disabled={pendingId === request.id}
              onClick={() => decide(request.id, "cancelled")}
            >
              <X className="mr-1 size-4" aria-hidden />
              Decline
            </Button>
            <Button
              size="sm"
              className="h-9 rounded-lg font-semibold"
              disabled={pendingId === request.id}
              onClick={() => decide(request.id, "confirmed")}
            >
              {pendingId === request.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Check className="mr-1 size-4" aria-hidden />
                  Approve
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
