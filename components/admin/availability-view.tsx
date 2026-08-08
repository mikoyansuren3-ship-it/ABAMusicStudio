"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarOff, Loader2, Plus, Trash2 } from "lucide-react"
import type { Availability, AvailabilityException } from "@/lib/types"
import {
  updateAvailability,
  addAvailability,
  deleteAvailability,
  addException,
  deleteException,
} from "@/app/admin/availability/actions"
import { AdminCard, DashedButton, Eyebrow, PageHeader } from "@/components/admin/ui"
import { DAY_NAMES, formatTimeRange, hoursLabel, timeToMinutes } from "@/lib/admin/format"

interface AvailabilityViewProps {
  summary: string
  availability: Availability[]
  exceptions: AvailabilityException[]
  /** Upcoming confirmed lessons per weekday, for the "turn off a day with lessons" confirm. */
  upcomingByWeekday: Record<number, number>
}

// Monday-first ordering for the weekly hours card.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

const timeInputClass =
  "h-[38px] min-w-[104px] flex-[0_1_132px] rounded-lg border-border bg-background px-3 text-sm"

export function AvailabilityView({ summary, availability, exceptions, upcomingByWeekday }: AvailabilityViewProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addDialogDay, setAddDialogDay] = useState<number | null>(null)
  const [closureDialogOpen, setClosureDialogOpen] = useState(false)
  const [closureSpecialHours, setClosureSpecialHours] = useState(false)

  async function handleToggle(slot: Availability, nextActive: boolean) {
    if (!nextActive) {
      const lessons = upcomingByWeekday[slot.day_of_week] || 0
      if (lessons > 0) {
        const dayName = DAY_NAMES[slot.day_of_week]
        const confirmed = window.confirm(
          `${lessons} upcoming ${lessons === 1 ? "lesson is" : "lessons are"} booked on ${dayName}s. ` +
            `Turning the day off stops new bookings but keeps existing lessons. Turn ${dayName} off?`,
        )
        if (!confirmed) return
      }
    }
    setIsLoading(true)
    await updateAvailability(slot.id, { is_active: nextActive })
    router.refresh()
    setIsLoading(false)
  }

  async function handleUpdateTime(id: string, field: "start_time" | "end_time", value: string) {
    if (!value) return
    await updateAvailability(id, { [field]: value })
    router.refresh()
  }

  async function handleDelete(slot: Availability) {
    const lessons = upcomingByWeekday[slot.day_of_week] || 0
    const dayName = DAY_NAMES[slot.day_of_week]
    const message =
      lessons > 0
        ? `${lessons} upcoming ${lessons === 1 ? "lesson is" : "lessons are"} booked on ${dayName}s. Remove this time block anyway?`
        : `Remove the ${dayName} time block?`
    if (!window.confirm(message)) return
    setIsLoading(true)
    await deleteAvailability(slot.id)
    router.refresh()
    setIsLoading(false)
  }

  async function handleAddAvailability(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    await addAvailability(new FormData(e.currentTarget))
    router.refresh()
    setIsLoading(false)
    setAddDialogOpen(false)
  }

  async function handleAddException(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    await addException(new FormData(e.currentTarget))
    router.refresh()
    setIsLoading(false)
    setClosureDialogOpen(false)
    setClosureSpecialHours(false)
  }

  async function handleDeleteException(exception: AvailabilityException) {
    if (!window.confirm("Remove this closure?")) return
    setIsLoading(true)
    await deleteException(exception.id)
    router.refresh()
    setIsLoading(false)
  }

  function openAddDialog(day: number | null) {
    setAddDialogDay(day)
    setAddDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Availability"
        summary={summary}
        actions={
          <Button
            className="h-10 gap-2 rounded-lg px-[18px] text-sm font-semibold"
            onClick={() => openAddDialog(null)}
          >
            <Plus className="size-4" aria-hidden />
            Add time block
          </Button>
        }
      />

      <AdminCard className="flex flex-col pb-3">
        <Eyebrow className="mb-1.5">Weekly hours</Eyebrow>

        {WEEK_ORDER.map((dayIndex, position) => {
          const slots = availability.filter((slot) => slot.day_of_week === dayIndex)
          const isLast = position === WEEK_ORDER.length - 1
          const rowBorder = isLast ? "" : "border-b"

          if (slots.length === 0) {
            return (
              <div key={dayIndex} className={`flex flex-wrap items-center gap-4 py-4 ${rowBorder}`}>
                <span className="w-28 shrink-0 text-[15px] font-semibold text-muted-foreground">
                  {DAY_NAMES[dayIndex]}
                </span>
                <Switch
                  checked={false}
                  onCheckedChange={() => openAddDialog(dayIndex)}
                  aria-label={`Open ${DAY_NAMES[dayIndex]}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => openAddDialog(dayIndex)}
                  className="text-[13px] font-semibold text-accent transition-colors hover:text-accent-strong"
                >
                  Add hours
                </button>
                <span className="min-w-0 flex-1" />
                <span className="text-xs text-muted-foreground">Closed</span>
                <span className="w-9 shrink-0" />
              </div>
            )
          }

          return slots.map((slot, slotIndex) => {
            const durationHours = (timeToMinutes(slot.end_time) - timeToMinutes(slot.start_time)) / 60
            return (
              <div
                key={slot.id}
                className={`flex flex-wrap items-center gap-4 py-4 ${slotIndex === slots.length - 1 ? rowBorder : ""}`}
              >
                <span
                  className={`w-28 shrink-0 text-[15px] font-semibold ${slot.is_active ? "" : "text-muted-foreground"}`}
                >
                  {slotIndex === 0 ? DAY_NAMES[dayIndex] : ""}
                </span>
                <Switch
                  checked={slot.is_active}
                  onCheckedChange={(checked) => handleToggle(slot, checked)}
                  aria-label={`${DAY_NAMES[dayIndex]} ${slot.is_active ? "open" : "closed"}`}
                  disabled={isLoading}
                />
                <Input
                  type="time"
                  aria-label={`${DAY_NAMES[dayIndex]} start time`}
                  defaultValue={slot.start_time.slice(0, 5)}
                  onChange={(e) => handleUpdateTime(slot.id, "start_time", e.target.value)}
                  className={timeInputClass}
                  disabled={!slot.is_active}
                />
                <span className="text-[13px] text-muted-foreground">to</span>
                <Input
                  type="time"
                  aria-label={`${DAY_NAMES[dayIndex]} end time`}
                  defaultValue={slot.end_time.slice(0, 5)}
                  onChange={(e) => handleUpdateTime(slot.id, "end_time", e.target.value)}
                  className={timeInputClass}
                  disabled={!slot.is_active}
                />
                <span className="min-w-0 flex-1" />
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {slot.is_active ? hoursLabel(durationHours) : "Off"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${DAY_NAMES[dayIndex]} block`}
                  onClick={() => handleDelete(slot)}
                  disabled={isLoading}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            )
          })
        })}
      </AdminCard>

      <AdminCard className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <Eyebrow>Closures</Eyebrow>
            {exceptions.length === 0 ? (
              <>
                <p className="font-serif text-[19px] font-semibold">No closures planned</p>
                <p className="text-[13px] text-muted-foreground">
                  Block a holiday or a week away and the website stops offering those slots.
                </p>
              </>
            ) : (
              <p className="text-[13px] text-muted-foreground">
                The website stops offering these dates. Special hours override the usual weekly window.
              </p>
            )}
          </div>
          <DashedButton onClick={() => setClosureDialogOpen(true)}>
            <CalendarOff className="size-[15px]" aria-hidden />
            Add closure
          </DashedButton>
        </div>

        {exceptions.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {exceptions.map((exception) => (
              <div key={exception.id} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold">
                    {new Date(`${exception.exception_date}T12:00:00`).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {exception.is_available && exception.start_time && exception.end_time
                      ? `Special hours: ${formatTimeRange(exception.start_time, exception.end_time)}`
                      : "Closed"}
                    {exception.reason ? ` · ${exception.reason}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label="Remove closure"
                  onClick={() => handleDeleteException(exception)}
                  disabled={isLoading}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Add time block dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-[460px] rounded-2xl border-border bg-card p-7 shadow-2xl">
          <form onSubmit={handleAddAvailability} className="flex flex-col gap-[22px]">
            <DialogHeader className="gap-1.5 text-left">
              <DialogTitle className="font-serif text-2xl font-bold">Add time block</DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                A recurring weekly window families can book from the website.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="block-day" className="text-xs font-semibold">
                  Day
                </Label>
                <Select
                  name="day_of_week"
                  required
                  key={addDialogDay ?? "unset"}
                  defaultValue={addDialogDay !== null ? String(addDialogDay) : undefined}
                >
                  <SelectTrigger id="block-day" className="h-[42px] w-full rounded-lg border-border bg-background text-sm">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_NAMES.map((day, index) => (
                      <SelectItem key={day} value={String(index)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3.5">
                <div className="flex flex-1 flex-col gap-[7px]">
                  <Label htmlFor="block-start" className="text-xs font-semibold">
                    Start time
                  </Label>
                  <Input
                    id="block-start"
                    name="start_time"
                    type="time"
                    required
                    defaultValue="15:00"
                    className="h-[42px] rounded-lg border-border bg-background text-sm"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-[7px]">
                  <Label htmlFor="block-end" className="text-xs font-semibold">
                    End time
                  </Label>
                  <Input
                    id="block-end"
                    name="end_time"
                    type="time"
                    required
                    defaultValue="19:00"
                    className="h-[42px] rounded-lg border-border bg-background text-sm"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2.5 border-t pt-5">
              <Button type="button" variant="outline" className="h-10 rounded-lg px-4" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="h-10 rounded-lg px-[18px] font-semibold">
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Add block"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add closure dialog */}
      <Dialog
        open={closureDialogOpen}
        onOpenChange={(open) => {
          setClosureDialogOpen(open)
          if (!open) setClosureSpecialHours(false)
        }}
      >
        <DialogContent className="max-w-[460px] rounded-2xl border-border bg-card p-7 shadow-2xl">
          <form onSubmit={handleAddException} className="flex flex-col gap-[22px]">
            <DialogHeader className="gap-1.5 text-left">
              <DialogTitle className="font-serif text-2xl font-bold">Add closure</DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                Block a date, or give it special hours instead of the usual window.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="closure-date" className="text-xs font-semibold">
                  Date
                </Label>
                <Input
                  id="closure-date"
                  name="exception_date"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="h-[42px] rounded-lg border-border bg-background text-sm"
                />
              </div>
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="closure-reason" className="text-xs font-semibold">
                  Reason (optional)
                </Label>
                <Input
                  id="closure-reason"
                  name="reason"
                  placeholder="e.g. Holiday, recital week"
                  className="h-[42px] rounded-lg border-border bg-background text-sm"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <Switch
                  id="closure-special"
                  name="is_available"
                  checked={closureSpecialHours}
                  onCheckedChange={setClosureSpecialHours}
                />
                <Label htmlFor="closure-special" className="font-normal">
                  Open with special hours instead
                </Label>
              </div>
              {closureSpecialHours && (
                <div className="flex gap-3.5">
                  <div className="flex flex-1 flex-col gap-[7px]">
                    <Label htmlFor="closure-start" className="text-xs font-semibold">
                      Start time
                    </Label>
                    <Input
                      id="closure-start"
                      name="start_time"
                      type="time"
                      defaultValue="15:00"
                      className="h-[42px] rounded-lg border-border bg-background text-sm"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-[7px]">
                    <Label htmlFor="closure-end" className="text-xs font-semibold">
                      End time
                    </Label>
                    <Input
                      id="closure-end"
                      name="end_time"
                      type="time"
                      defaultValue="19:00"
                      className="h-[42px] rounded-lg border-border bg-background text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2.5 border-t pt-5">
              <Button type="button" variant="outline" className="h-10 rounded-lg px-4" onClick={() => setClosureDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="h-10 rounded-lg px-[18px] font-semibold">
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Save closure"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
