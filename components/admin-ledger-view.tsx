"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  HelpCircle,
  Loader2,
  Pencil,
  Wallet,
  X,
  XCircle,
} from "lucide-react"
import type { Booking, StudentBilling } from "@/lib/types"
import { setAttendance, setMadeUp, saveStudentBilling } from "@/app/admin/ledger/actions"
import { formatCurrency } from "@/lib/portal/format"

export interface LedgerRow {
  student: {
    id: string
    name: string
    is_active: boolean
    preferred_lesson_duration: 30 | 45 | 60
  }
  billing: StudentBilling | null
  lessons: Booking[]
  expectedCents: number
}

interface AdminLedgerViewProps {
  mode: "month" | "week"
  /** "2026-08" in month mode, the week's Sunday "2026-08-02" in week mode. */
  anchor: string
  rows: LedgerRow[]
  collectedCents: number
  nowMs: number
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split("-").map(Number)
  const shifted = new Date(year, month - 1 + delta, 1)
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function shiftWeek(weekKey: string, deltaDays: number) {
  const shifted = parseDateKey(weekKey)
  shifted.setDate(shifted.getDate() + deltaDays)
  return toDateKey(shifted)
}

/** e.g. "July 21–27, 2026" or "July 26 – August 1, 2026" across a month boundary. */
function weekLabel(weekKey: string) {
  const start = parseDateKey(weekKey)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const startMonth = start.toLocaleDateString("en-US", { month: "long" })
  const endMonth = end.toLocaleDateString("en-US", { month: "long" })
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`
  }
  return `${startMonth} ${start.getDate()}, ${start.getFullYear()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`
}

function formatLessonTime(time: string) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function lessonDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function madeUpDateLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function todayDateValue(nowMs: number) {
  const d = new Date(nowMs)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function AdminLedgerView({ mode, anchor, rows, collectedCents, nowMs }: AdminLedgerViewProps) {
  const router = useRouter()
  const [billingStudent, setBillingStudent] = useState<LedgerRow | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null)
  const [makeupLesson, setMakeupLesson] = useState<Booking | null>(null)
  const [makeupError, setMakeupError] = useState<string | null>(null)
  const [isSavingMakeup, setIsSavingMakeup] = useState(false)

  const billedRows = rows.filter((row) => row.billing)
  const unbilledRows = rows.filter((row) => !row.billing)

  const allLessons = billedRows.flatMap((row) => row.lessons)
  const expectedTotal = billedRows.reduce((sum, row) => sum + row.expectedCents, 0)
  const onTimeCount = allLessons.filter((l) => l.attendance === "on_time").length
  const missedCount = allLessons.filter((l) => l.attendance === "missed").length
  const madeUpCount = allLessons.filter((l) => l.attendance === "missed" && l.made_up_on).length
  const deductedCents = billedRows.reduce(
    (sum, row) =>
      sum + row.billing!.rate_cents * row.lessons.filter((l) => l.attendance === "missed" && !l.made_up_on).length,
    0,
  )
  const unmarkedPast = allLessons.filter((l) => !l.attendance && new Date(l.start_time).getTime() <= nowMs).length

  const periodNoun = mode === "week" ? "week" : "month"
  const headerLabel = mode === "week" ? weekLabel(anchor) : monthLabel(anchor)
  const prevHref =
    mode === "week"
      ? `/admin/ledger?view=week&week=${shiftWeek(anchor, -7)}`
      : `/admin/ledger?view=month&month=${shiftMonth(anchor, -1)}`
  const nextHref =
    mode === "week"
      ? `/admin/ledger?view=week&week=${shiftWeek(anchor, 7)}`
      : `/admin/ledger?view=month&month=${shiftMonth(anchor, 1)}`
  const todayHref = mode === "week" ? "/admin/ledger?view=week" : "/admin/ledger"
  const currentMonthKey = toDateKey(new Date(nowMs)).slice(0, 7)
  // Switching views keeps you in the period you were looking at.
  const monthToggleHref = mode === "week" ? `/admin/ledger?view=month&month=${anchor.slice(0, 7)}` : "#"
  const weekToggleHref =
    mode === "month"
      ? anchor === currentMonthKey
        ? "/admin/ledger?view=week"
        : `/admin/ledger?view=week&week=${anchor}-01`
      : "#"

  async function handleMark(lesson: Booking, attendance: "on_time" | "missed" | null) {
    setPendingLessonId(lesson.id)
    await setAttendance(lesson.id, attendance)
    router.refresh()
    setPendingLessonId(null)
  }

  async function handleSaveMakeup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!makeupLesson) return
    const madeUpOn = new FormData(e.currentTarget).get("made_up_on") as string
    if (!madeUpOn) {
      setMakeupError("Choose the day the make-up class happened.")
      return
    }
    setIsSavingMakeup(true)
    setMakeupError(null)
    const result = await setMadeUp(makeupLesson.id, madeUpOn)
    if (result?.error) {
      setMakeupError(result.error)
      setIsSavingMakeup(false)
      return
    }
    router.refresh()
    setIsSavingMakeup(false)
    setMakeupLesson(null)
  }

  async function handleRemoveMakeup() {
    if (!makeupLesson) return
    setIsSavingMakeup(true)
    setMakeupError(null)
    const result = await setMadeUp(makeupLesson.id, null)
    if (result?.error) {
      setMakeupError(result.error)
      setIsSavingMakeup(false)
      return
    }
    router.refresh()
    setIsSavingMakeup(false)
    setMakeupLesson(null)
  }

  async function handleSaveBilling(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!billingStudent) return
    setIsSaving(true)
    setSaveError(null)
    const result = await saveStudentBilling(billingStudent.student.id, new FormData(e.currentTarget))
    if (result?.error) {
      setSaveError(result.error)
      setIsSaving(false)
      return
    }
    router.refresh()
    setIsSaving(false)
    setBillingStudent(null)
  }

  function LessonChip({ lesson }: { lesson: Booking }) {
    const isPending = pendingLessonId === lesson.id
    const isPast = new Date(lesson.start_time).getTime() <= nowMs
    const dateLabel = lessonDateLabel(lesson.start_time)

    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          {dateLabel}
        </span>
      )
    }

    if (lesson.attendance === "on_time") {
      return (
        <button
          type="button"
          onClick={() => handleMark(lesson, null)}
          title="Marked on time — click to undo"
          className="inline-flex items-center gap-1 rounded-md border border-green-600 px-2 py-1 text-xs text-green-600 hover:bg-green-600/10"
        >
          <Check className="h-3 w-3" />
          {dateLabel}
        </button>
      )
    }

    if (lesson.attendance === "missed" && lesson.made_up_on) {
      return (
        <button
          type="button"
          onClick={() => {
            setMakeupError(null)
            setMakeupLesson(lesson)
          }}
          title={`Missed, made up on ${madeUpDateLabel(lesson.made_up_on)} — click to change`}
          className="inline-flex items-center gap-1 rounded-md border border-amber-600 px-2 py-1 text-xs text-amber-600 hover:bg-amber-600/10"
        >
          <CalendarCheck className="h-3 w-3" />
          {dateLabel}
          <ArrowRight className="h-3 w-3" />
          {madeUpDateLabel(lesson.made_up_on)}
        </button>
      )
    }

    if (lesson.attendance === "missed") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-destructive px-2 py-1 text-xs text-destructive">
          <button
            type="button"
            onClick={() => handleMark(lesson, null)}
            title="Marked missed — click to undo"
            className="inline-flex items-center gap-1 hover:opacity-70"
          >
            <X className="h-3 w-3" />
            {dateLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              setMakeupError(null)
              setMakeupLesson(lesson)
            }}
            title="Was this lesson made up?"
            className="rounded p-0.5 hover:bg-destructive/10"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </span>
      )
    }

    if (!isPast) {
      return (
        <span className="inline-flex items-center rounded-md border border-dashed px-2 py-1 text-xs text-muted-foreground">
          {dateLabel}
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
        <span className="text-muted-foreground">{dateLabel}</span>
        <button
          type="button"
          onClick={() => handleMark(lesson, "on_time")}
          title="Came on time"
          className="rounded p-0.5 text-green-600 hover:bg-green-600/10"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleMark(lesson, "missed")}
          title="Missed class"
          className="rounded p-0.5 text-destructive hover:bg-destructive/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* Period navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{headerLabel}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg border p-1">
            <Button variant={mode === "month" ? "default" : "ghost"} size="sm" asChild={mode !== "month"}>
              {mode === "month" ? <span>Monthly</span> : <Link href={monthToggleHref}>Monthly</Link>}
            </Button>
            <Button variant={mode === "week" ? "default" : "ghost"} size="sm" asChild={mode !== "week"}>
              {mode === "week" ? <span>Weekly</span> : <Link href={weekToggleHref}>Weekly</Link>}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={prevHref} aria-label={`Previous ${periodNoun}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={todayHref}>Today</Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href={nextHref} aria-label={`Next ${periodNoun}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(expectedTotal)}</p>
            <p className="text-sm text-muted-foreground">{allLessons.length} lessons scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(collectedCents)}</p>
            <p className="text-sm text-muted-foreground">Paid invoices this {periodNoun}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Time</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{onTimeCount}</p>
            <p className="text-sm text-muted-foreground">
              {unmarkedPast > 0 ? `${unmarkedPast} awaiting a mark` : "All caught up"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Missed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{missedCount}</p>
            <p className="text-sm text-muted-foreground">
              {missedCount > 0
                ? `${formatCurrency(deductedCents)} deducted · ${madeUpCount} made up`
                : `This ${periodNoun}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Student ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Student Ledger</CardTitle>
          <CardDescription>
            Lessons are generated from each student&apos;s weekly slot. Mark attendance after each class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billedRows.length > 0 ? (
            <div className="space-y-3">
              {billedRows.map((row) => {
                const unpaidMissed = row.lessons.filter((l) => l.attendance === "missed" && !l.made_up_on).length
                return (
                <div key={row.student.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{row.student.name}</p>
                        {!row.student.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {row.billing!.day_of_week != null && row.billing!.lesson_time
                          ? `${DAY_NAMES[row.billing!.day_of_week]}s at ${formatLessonTime(row.billing!.lesson_time)}`
                          : "No weekly slot set"}{" "}
                        · {row.billing!.duration_minutes} min · {formatCurrency(row.billing!.rate_cents)}/lesson
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(row.expectedCents)}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.lessons.length} lessons
                          {unpaidMissed > 0 ? ` · ${unpaidMissed} unpaid missed` : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSaveError(null)
                          setBillingStudent(row)
                        }}
                        aria-label={`Edit billing for ${row.student.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.lessons.map((lesson) => (
                      <LessonChip key={lesson.id} lesson={lesson} />
                    ))}
                    {row.lessons.length === 0 && (
                      <p className="text-sm text-muted-foreground">No lessons this {periodNoun}</p>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No students have billing set up yet. Set a rate and weekly slot below to start tracking income.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students without billing */}
      {unbilledRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Needs Billing Setup</CardTitle>
            <CardDescription>These students have no rate or weekly slot yet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unbilledRows.map((row) => (
                <div key={row.student.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{row.student.name}</p>
                    {!row.student.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSaveError(null)
                      setBillingStudent(row)
                    }}
                  >
                    Set Rate & Slot
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Make-up dialog */}
      <Dialog open={makeupLesson !== null} onOpenChange={(open) => !open && setMakeupLesson(null)}>
        <DialogContent className="max-w-sm">
          {makeupLesson && (
            <form onSubmit={handleSaveMakeup}>
              <DialogHeader>
                <DialogTitle>Was this lesson made up?</DialogTitle>
                <DialogDescription>
                  Missed on {lessonDateLabel(makeupLesson.start_time)}. Recording a make-up day counts the lesson as
                  paid again.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="made_up_on">Made up on</Label>
                  <Input
                    id="made_up_on"
                    name="made_up_on"
                    type="date"
                    required
                    defaultValue={makeupLesson.made_up_on ?? todayDateValue(nowMs)}
                  />
                </div>
                {makeupError && <p className="text-sm text-destructive">{makeupError}</p>}
              </div>
              <DialogFooter>
                {makeupLesson.made_up_on && (
                  <Button type="button" variant="outline" onClick={handleRemoveMakeup} disabled={isSavingMakeup}>
                    Remove Make-Up
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setMakeupLesson(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingMakeup}>
                  {isSavingMakeup ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Billing dialog */}
      <Dialog open={billingStudent !== null} onOpenChange={(open) => !open && setBillingStudent(null)}>
        <DialogContent>
          {billingStudent && (
            <form onSubmit={handleSaveBilling}>
              <DialogHeader>
                <DialogTitle>Billing for {billingStudent.student.name}</DialogTitle>
                <DialogDescription>Per-lesson rate and fixed weekly time slot</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate per lesson (in dollars)</Label>
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="45.00"
                    defaultValue={billingStudent.billing ? (billingStudent.billing.rate_cents / 100).toFixed(2) : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Lesson day</Label>
                  <Select
                    name="day_of_week"
                    defaultValue={
                      billingStudent.billing?.day_of_week != null
                        ? String(billingStudent.billing.day_of_week)
                        : "none"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Not set" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      {DAY_NAMES.map((day, index) => (
                        <SelectItem key={day} value={String(index)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson_time">Lesson time</Label>
                  <Input
                    id="lesson_time"
                    name="lesson_time"
                    type="time"
                    defaultValue={billingStudent.billing?.lesson_time?.slice(0, 5) ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    name="duration"
                    required
                    defaultValue={String(
                      billingStudent.billing?.duration_minutes ?? billingStudent.student.preferred_lesson_duration,
                    )}
                  >
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
                {saveError && <p className="text-sm text-destructive">{saveError}</p>}
                <p className="text-xs text-muted-foreground">
                  Lessons repeat weekly on the chosen day. Changes apply from the current month forward.
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setBillingStudent(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
