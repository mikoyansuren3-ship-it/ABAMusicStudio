"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Check, Loader2, RotateCcw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { markAttendance, type AttendanceMark } from "@/app/(teacher)/actions"

interface AttendanceControlsProps {
  bookingId: string
  studentName: string
  attendance: AttendanceMark
  /** Compact variant for list rows away from the Today screen. */
  size?: "lg" | "sm"
  className?: string
}

const LABELS: Record<"on_time" | "missed", string> = {
  on_time: "Came",
  missed: "No-show",
}

/**
 * The two decisions a teacher makes after a lesson. Marking is a server action,
 * so the week calendar and the roster re-render with the new state — the mark
 * is one fact, shown everywhere it matters.
 */
export function AttendanceControls({
  bookingId,
  studentName,
  attendance,
  size = "lg",
  className,
}: AttendanceControlsProps) {
  const [isPending, startTransition] = useTransition()

  function mark(next: AttendanceMark) {
    startTransition(async () => {
      const result = await markAttendance(bookingId, next)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(
        next === null ? `Cleared ${studentName}'s mark` : `${studentName} marked ${LABELS[next].toLowerCase()}`,
      )
    })
  }

  const base = cn(
    "inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-semibold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-60",
    size === "lg" ? "h-12 min-w-[132px] px-5 text-[15px]" : "h-9 px-3 text-[13px]",
  )
  const iconSize = size === "lg" ? "size-[18px]" : "size-4"

  if (attendance) {
    const marked = attendance === "on_time"
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <span
          className={cn(
            base,
            "flex-none cursor-default",
            marked
              ? "border-accent bg-accent/10 text-accent-strong"
              : "border-destructive bg-destructive/10 text-destructive",
          )}
        >
          {marked ? <Check className={iconSize} aria-hidden /> : <X className={iconSize} aria-hidden />}
          {marked ? "Came" : "No-show"}
        </span>
        <button
          type="button"
          onClick={() => mark(null)}
          disabled={isPending}
          aria-label={`Clear ${studentName}'s attendance mark`}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors",
            "hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "disabled:cursor-not-allowed disabled:opacity-60",
            size === "lg" ? "size-12" : "size-9",
          )}
        >
          {isPending ? (
            <Loader2 className={cn(iconSize, "animate-spin")} aria-hidden />
          ) : (
            <RotateCcw className={iconSize} aria-hidden />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className={cn("flex items-stretch gap-2.5", className)}>
      <button
        type="button"
        onClick={() => mark("on_time")}
        disabled={isPending}
        className={cn(base, "border-accent bg-accent text-accent-foreground hover:bg-accent-strong")}
      >
        {isPending ? (
          <Loader2 className={cn(iconSize, "animate-spin")} aria-hidden />
        ) : (
          <Check className={iconSize} aria-hidden />
        )}
        Came
        <span className="sr-only">— mark {studentName} present</span>
      </button>
      <button
        type="button"
        onClick={() => mark("missed")}
        disabled={isPending}
        className={cn(base, "border-destructive bg-card text-destructive hover:bg-destructive/10")}
      >
        <X className={iconSize} aria-hidden />
        No-show
        <span className="sr-only">— mark {studentName} absent</span>
      </button>
    </div>
  )
}
