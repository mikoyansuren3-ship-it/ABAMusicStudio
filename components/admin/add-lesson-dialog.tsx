"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Plus } from "lucide-react"
import { createBooking } from "@/app/admin/schedule/actions"
import { DashedButton } from "@/components/admin/ui"
import { DAY_NAMES, formatTimeRange, toDateKey } from "@/lib/admin/format"
import type { Availability } from "@/lib/types"

interface StudentOption {
  id: string
  name: string
  guardian: string | null
}

interface AddLessonButtonProps {
  students: StudentOption[]
  availability: Availability[]
  variant?: "primary" | "dashed"
  label?: string
}

const fieldClass = "h-[42px] rounded-lg border-border bg-background text-sm"

/** "Add lesson" button + dialog. Booking outside open hours asks for confirmation instead of failing. */
export function AddLessonButton({ students, availability, variant = "primary", label = "Add lesson" }: AddLessonButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const [date, setDate] = useState(() => toDateKey(new Date()))

  const todayKey = toDateKey(new Date())

  const hint = (() => {
    const parsed = new Date(`${date}T12:00:00`)
    if (Number.isNaN(parsed.getTime())) return "Times outside the studio's open hours will ask you to confirm."
    const dayName = DAY_NAMES[parsed.getDay()]
    const slots = availability.filter((slot) => slot.is_active && slot.day_of_week === parsed.getDay())
    if (slots.length === 0) {
      return `The studio is closed on ${dayName}s. Booking anyway will ask you to confirm.`
    }
    const ranges = slots.map((slot) => formatTimeRange(slot.start_time, slot.end_time)).join(", ")
    return `${dayName} hours are ${ranges}. Times outside them will ask you to confirm.`
  })()

  function resetAndClose() {
    setOpen(false)
    setNeedsConfirm(false)
    setActionError(null)
  }

  async function submit(formData: FormData) {
    setIsLoading(true)
    setActionError(null)
    const result = await createBooking(formData)
    if (result?.error) {
      if ("code" in result && result.code === "outside_availability") {
        setNeedsConfirm(true)
      } else {
        setActionError(result.error)
        setNeedsConfirm(false)
      }
      setIsLoading(false)
      return
    }
    router.refresh()
    setIsLoading(false)
    resetAndClose()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await submit(new FormData(e.currentTarget))
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : resetAndClose())}>
      <DialogTrigger asChild>
        {variant === "dashed" ? (
          <DashedButton>
            <Plus className="size-3.5" aria-hidden />
            {label}
          </DashedButton>
        ) : (
          <Button className="h-10 gap-2 rounded-lg px-[18px] text-sm font-semibold">
            <Plus className="size-4" aria-hidden />
            {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[460px] rounded-2xl border-border bg-card p-7 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="font-serif text-2xl font-bold">New lesson</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Booked lessons show on the family&apos;s portal right away.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-[7px]">
              <Label htmlFor="student_id" className="text-xs font-semibold">
                Student
              </Label>
              <Select name="student_id" required>
                <SelectTrigger id="student_id" className={`${fieldClass} w-full`}>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                      {student.guardian ? ` (${student.guardian})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-[7px]">
              <Label htmlFor="lesson-date" className="text-xs font-semibold">
                Date
              </Label>
              <Input
                id="lesson-date"
                name="date"
                type="date"
                required
                min={todayKey}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setNeedsConfirm(false)
                }}
                className={fieldClass}
              />
            </div>
            <div className="flex gap-3.5">
              <div className="flex flex-1 flex-col gap-[7px]">
                <Label htmlFor="lesson-start" className="text-xs font-semibold">
                  Start time
                </Label>
                <Input
                  id="lesson-start"
                  name="start_time"
                  type="time"
                  required
                  className={fieldClass}
                  onChange={() => setNeedsConfirm(false)}
                />
              </div>
              <div className="flex flex-1 flex-col gap-[7px]">
                <Label htmlFor="lesson-duration" className="text-xs font-semibold">
                  Duration
                </Label>
                <Select name="duration" defaultValue="30">
                  <SelectTrigger id="lesson-duration" className={`${fieldClass} w-full`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs leading-[18px] text-muted-foreground">{hint}</p>
            {needsConfirm && (
              <p role="alert" aria-live="polite" className="rounded-lg border border-accent/50 bg-accent/5 px-3 py-2.5 text-[13px] leading-5 text-accent-strong">
                This time is outside the studio&apos;s open hours. Book it anyway?
              </p>
            )}
            {actionError && (
              <p role="alert" aria-live="polite" className="text-sm text-destructive">
                {actionError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2.5 border-t pt-5">
            <Button type="button" variant="outline" className="h-10 rounded-lg px-4" onClick={resetAndClose}>
              Cancel
            </Button>
            {needsConfirm ? (
              <Button
                type="button"
                disabled={isLoading}
                className="h-10 rounded-lg px-[18px] font-semibold"
                onClick={(e) => {
                  const form = (e.currentTarget as HTMLButtonElement).closest("form")
                  if (!form) return
                  const formData = new FormData(form)
                  formData.set("confirm_outside", "1")
                  void submit(formData)
                }}
              >
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Book anyway"}
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading} className="h-10 rounded-lg px-[18px] font-semibold">
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Book lesson"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
