"use client"

import { RefreshCw, X } from "lucide-react"
import type { Booking } from "@/lib/types"
import { formatTime } from "@/lib/portal/format"
import { PortalButton, PortalDateBadge, PortalStatusBadge } from "./portal-ui"

interface LessonRowProps {
  booking: Booking
  isFirst?: boolean
  showActions?: boolean
  canModify?: boolean
  onReschedule?: () => void
  onCancel?: () => void
  faded?: boolean
}

export function LessonRow({
  booking,
  isFirst,
  showActions,
  canModify,
  onReschedule,
  onCancel,
  faded,
}: LessonRowProps) {
  const start = new Date(booking.start_time)
  const weekday = start.toLocaleDateString("en-US", { weekday: "long" })

  return (
    <div
      className={[
        "group flex items-center gap-3.5 rounded-[10px] border-b border-[rgba(78,52,37,0.03)] px-3.5 py-3 transition-colors last:border-b-0",
        isFirst ? "bg-[rgba(201,169,110,0.02)]" : "",
        faded ? "opacity-70" : "hover:bg-[rgba(201,169,110,0.03)]",
      ].join(" ")}
    >
      <PortalDateBadge iso={booking.start_time} highlight={isFirst && !faded} compact={faded} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-[#2b1b14]">
          {weekday}
          {isFirst && !faded ? (
            <span className="rounded-full bg-[#C9A96E] px-2 py-0.5 text-[9.5px] font-bold tracking-wide text-[#2A1810] uppercase">
              Next
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-[#8B7355]">
          {formatTime(booking.start_time)} – {formatTime(booking.end_time)} · Piano
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <PortalStatusBadge status={booking.status} />
        {showActions && canModify && booking.status === "confirmed" ? (
          <div className="flex flex-wrap gap-1 lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
            <PortalButton variant="ghost" className="px-2.5 py-1.5" onClick={onReschedule}>
              <RefreshCw className="h-3 w-3" />
              Reschedule
            </PortalButton>
            <PortalButton variant="ghost" className="px-2.5 py-1.5 text-[#9A4040]" onClick={onCancel}>
              <X className="h-3 w-3" />
              Cancel
            </PortalButton>
          </div>
        ) : null}
      </div>
    </div>
  )
}
