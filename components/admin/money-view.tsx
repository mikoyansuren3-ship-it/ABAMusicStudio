"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react"
import type { Booking, StudentBilling, StudentSlot, Teacher } from "@/lib/types"
import { setAttendance, setMadeUp } from "@/app/admin/money/actions"
import { AdminCard, Eyebrow, NavSquareLink, PageHeader, PillTabs } from "@/components/admin/ui"
import { CreateInvoiceButton, type InvoiceStudentOption } from "@/components/admin/create-invoice-dialog"
import { InvoicesList, type InvoiceRow } from "@/components/admin/invoices-list"
import { StudentPanel, type PanelStudent } from "@/components/admin/student-panel"
import { initials, slotsLabel } from "@/lib/admin/format"
import { dateKeyUtc } from "@/lib/studio-time"
import { formatCurrency, experienceLabel } from "@/lib/portal/format"

export interface MoneyLedgerRow {
  studentId: string
  name: string
  isActive: boolean
  billing: StudentBilling
  slots: StudentSlot[]
  lessons: Booking[]
  expectedCents: number
}

export interface TeacherBucket {
  teacherId: string | null
  name: string
  grossCents: number
  payCents: number
  profitCents: number
  lessonCount: number
}

export interface MoneyStats {
  outstandingCents: number
  unpaidCount: number
  collectedCents: number
  paidCount: number
  expectedCents: number
  lessonCount: number
  missedCount: number
  madeUpCount: number
  deductedCents: number
  attendanceToMark: number
  hasAnyBilling: boolean
}

interface MoneyViewProps {
  tab: "invoices" | "income"
  mode: "month" | "week"
  summary: string
  periodShortLabel: string
  hrefs: {
    prev: string
    next: string
    current: string
    invoicesTab: string
    incomeTab: string
    monthMode: string
    weekMode: string
  }
  stats: MoneyStats
  rows: MoneyLedgerRow[]
  byTeacher: TeacherBucket[]
  invoices: InvoiceRow[]
  students: PanelStudent[]
  teachers: Teacher[]
  nowMs: number
}

function lessonDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function madeUpDateLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const chipBase = "inline-flex items-center gap-[5px] rounded-md px-[9px] py-1 text-xs transition-colors"

export function MoneyView({
  tab,
  mode,
  summary,
  periodShortLabel,
  hrefs,
  stats,
  rows,
  byTeacher,
  invoices,
  students,
  teachers,
  nowMs,
}: MoneyViewProps) {
  const router = useRouter()
  const [panelStudentId, setPanelStudentId] = useState<string | null>(null)
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null)
  const [makeupLesson, setMakeupLesson] = useState<Booking | null>(null)
  const [makeupError, setMakeupError] = useState<string | null>(null)
  const [isSavingMakeup, setIsSavingMakeup] = useState(false)

  const panelStudent = students.find((student) => student.id === panelStudentId) ?? null
  const activeStudents = students.filter((student) => student.is_active)
  const invoiceStudents: InvoiceStudentOption[] = activeStudents.map((student) => ({
    id: student.id,
    name: student.name,
    guardian: student.profile?.full_name || student.contact_name || null,
    email: student.contact_email,
    hasPortalAccount: student.parent_id !== null,
  }))

  const needsSetup = activeStudents.filter(
    (student) => !student.billing || student.billing.rate_cents <= 0 || student.slots.length === 0,
  )

  const periodNoun = mode === "week" ? "week" : "month"

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

  function AttendanceChip({ lesson }: { lesson: Booking }) {
    const isPending = pendingLessonId === lesson.id
    const isPast = new Date(lesson.start_time).getTime() <= nowMs
    const dateLabel = lessonDateLabel(lesson.start_time)

    if (isPending) {
      return (
        <span className={`${chipBase} border text-muted-foreground`}>
          <Loader2 className="size-3 animate-spin" aria-hidden />
          {dateLabel}
        </span>
      )
    }

    if (lesson.attendance === "on_time") {
      return (
        <button
          type="button"
          onClick={() => handleMark(lesson, "missed")}
          title="Came — tap to mark missed instead"
          className={`${chipBase} border border-green-600 text-green-600 hover:bg-green-600/10`}
        >
          <Check className="size-3" aria-hidden />
          {dateLabel} · came
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
          title={`Missed, made up on ${madeUpDateLabel(lesson.made_up_on)} — tap to change`}
          className={`${chipBase} border border-amber-600 text-amber-600 hover:bg-amber-600/10`}
        >
          <CalendarCheck className="size-3" aria-hidden />
          {dateLabel}
          <ArrowRight className="size-3" aria-hidden />
          {madeUpDateLabel(lesson.made_up_on)} · made up
        </button>
      )
    }

    if (lesson.attendance === "missed") {
      return (
        <span className={`${chipBase} border border-destructive p-0 text-destructive`}>
          <button
            type="button"
            onClick={() => handleMark(lesson, null)}
            title="Missed — tap to clear the mark"
            className="inline-flex items-center gap-[5px] py-1 pl-[9px] hover:opacity-70"
          >
            <X className="size-3" aria-hidden />
            {dateLabel} · missed
          </button>
          <button
            type="button"
            onClick={() => {
              setMakeupError(null)
              setMakeupLesson(lesson)
            }}
            title="Was this lesson made up?"
            aria-label={`Record a make-up for ${dateLabel}`}
            className="rounded-r-md py-1 pl-1 pr-[7px] hover:bg-destructive/10"
          >
            <CalendarCheck className="size-3.5" aria-hidden />
          </button>
        </span>
      )
    }

    if (!isPast) {
      return (
        <span className={`${chipBase} border border-dashed text-muted-foreground`}>{dateLabel} · upcoming</span>
      )
    }

    return (
      <button
        type="button"
        onClick={() => handleMark(lesson, "on_time")}
        title="Tap to mark: came"
        className={`${chipBase} border text-foreground hover:border-green-600 hover:text-green-600`}
      >
        {dateLabel}
      </button>
    )
  }

  const statCells = [
    {
      label: "Outstanding",
      value: formatCurrency(stats.outstandingCents),
      footnote:
        stats.unpaidCount === 0
          ? "No unpaid invoices"
          : `${stats.unpaidCount} unpaid ${stats.unpaidCount === 1 ? "invoice" : "invoices"}`,
      accent: false,
    },
    {
      label: `Collected ${periodShortLabel}`,
      value: formatCurrency(stats.collectedCents),
      footnote: `${stats.paidCount} ${stats.paidCount === 1 ? "invoice" : "invoices"} paid`,
      accent: false,
    },
    {
      label: `Expected ${periodShortLabel}`,
      value: formatCurrency(stats.expectedCents),
      footnote: !stats.hasAnyBilling
        ? "No rates set yet"
        : stats.missedCount > 0
          ? `${stats.lessonCount} lessons · ${formatCurrency(stats.deductedCents)} off for ${stats.missedCount} missed${stats.madeUpCount > 0 ? `, ${stats.madeUpCount} made up` : ""}`
          : `${stats.lessonCount} ${stats.lessonCount === 1 ? "lesson" : "lessons"} on the books`,
      accent: true,
    },
    {
      label: "Attendance to mark",
      value: String(stats.attendanceToMark),
      footnote: stats.attendanceToMark === 0 ? "All caught up" : "Tap the chips below after class",
      accent: false,
    },
  ]

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Invoices and income"
        summary={summary}
        actions={
          <>
            <div className="flex items-center gap-2">
              <NavSquareLink href={hrefs.prev} ariaLabel={`Previous ${periodNoun}`}>
                <ChevronLeft className="size-4" aria-hidden />
              </NavSquareLink>
              <Link
                href={hrefs.current}
                className="inline-flex h-[38px] items-center rounded-lg border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted/50"
              >
                {mode === "week" ? "This week" : "This month"}
              </Link>
              <NavSquareLink href={hrefs.next} ariaLabel={`Next ${periodNoun}`}>
                <ChevronRight className="size-4" aria-hidden />
              </NavSquareLink>
            </div>
            <CreateInvoiceButton students={invoiceStudents} />
          </>
        }
      />

      <PillTabs
        tabs={[
          { href: hrefs.invoicesTab, label: "Invoices", active: tab === "invoices" },
          { href: hrefs.incomeTab, label: "Income and attendance", active: tab === "income" },
        ]}
      />

      <div className="grid grid-cols-2 overflow-hidden rounded-xl border bg-card shadow-sm md:grid-cols-4">
        {statCells.map((cell, index) => (
          <div
            key={cell.label}
            className={`flex flex-col gap-2 px-6 py-5 ${index % 2 === 1 ? "border-l" : ""} ${
              index >= 2 ? "border-t md:border-t-0" : ""
            } ${index > 0 ? "md:border-l" : ""}`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {cell.label}
            </span>
            <span className={`font-serif text-[28px] font-semibold leading-none ${cell.accent ? "text-accent" : ""}`}>
              {cell.value}
            </span>
            <span className="text-xs text-muted-foreground">{cell.footnote}</span>
          </div>
        ))}
      </div>

      {tab === "income" && teachers.length > 0 && byTeacher.length > 0 && (
        <AdminCard className="flex flex-col gap-1.5 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Eyebrow>By teacher</Eyebrow>
            <Link
              href="/admin/teachers"
              className="text-[13px] font-semibold text-accent transition-colors hover:text-accent-strong"
            >
              Manage teachers
            </Link>
          </div>
          <p className="mb-2 text-[13px] text-muted-foreground">
            {`What each teacher's lessons earn ${periodShortLabel} — missed lessons without a make-up don't count for anyone.`}
          </p>
          <div className="hidden items-center gap-4 border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:flex">
            <span className="min-w-0 flex-[1.6]">Teacher</span>
            <span className="w-20 text-right">Lessons</span>
            <span className="w-24 text-right">Gross</span>
            <span className="w-24 text-right">Pay</span>
            <span className="w-28 text-right">Your profit</span>
          </div>
          {byTeacher.map((bucket) => (
            <div
              key={bucket.teacherId ?? "unassigned"}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b py-2.5 last:border-b-0"
            >
              <span className="min-w-0 flex-[1.6] truncate text-sm font-medium">
                {bucket.teacherId ? (
                  <Link
                    href={`/admin/teachers/${bucket.teacherId}`}
                    className="transition-colors hover:text-accent-strong"
                  >
                    {bucket.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{bucket.name}</span>
                )}
              </span>
              <span className="hidden w-20 text-right text-sm text-muted-foreground sm:block">
                {bucket.lessonCount}
              </span>
              <span className="w-24 text-right text-sm">{formatCurrency(bucket.grossCents)}</span>
              <span className="w-24 text-right text-sm text-muted-foreground">{formatCurrency(bucket.payCents)}</span>
              <span className="w-28 text-right font-serif text-lg font-semibold leading-none">
                {formatCurrency(bucket.profitCents)}
              </span>
            </div>
          ))}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-2.5">
            <span className="min-w-0 flex-[1.6] text-sm font-semibold">Total</span>
            <span className="hidden w-20 text-right text-sm text-muted-foreground sm:block">
              {byTeacher.reduce((sum, bucket) => sum + bucket.lessonCount, 0)}
            </span>
            <span className="w-24 text-right text-sm font-semibold">
              {formatCurrency(byTeacher.reduce((sum, bucket) => sum + bucket.grossCents, 0))}
            </span>
            <span className="w-24 text-right text-sm text-muted-foreground">
              {formatCurrency(byTeacher.reduce((sum, bucket) => sum + bucket.payCents, 0))}
            </span>
            <span className="w-28 text-right font-serif text-lg font-semibold leading-none">
              {formatCurrency(byTeacher.reduce((sum, bucket) => sum + bucket.profitCents, 0))}
            </span>
          </div>
        </AdminCard>
      )}

      {tab === "invoices" ? (
        <InvoicesList invoices={invoices} students={invoiceStudents} nowMs={nowMs} />
      ) : (
        <AdminCard className="flex flex-col gap-4 pb-[26px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Eyebrow>Student ledger</Eyebrow>
              <p className="text-[13px] text-muted-foreground">
                Lessons come from each student&apos;s weekly slot — mark attendance after class and the {periodNoun}{" "}
                adds itself up.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border bg-card p-1">
              <Link
                href={hrefs.monthMode}
                aria-current={mode === "month" ? "page" : undefined}
                className={`inline-flex h-7 items-center rounded-md px-3 text-xs ${
                  mode === "month" ? "bg-primary font-semibold text-primary-foreground" : "font-medium hover:bg-muted/50"
                }`}
              >
                Monthly
              </Link>
              <Link
                href={hrefs.weekMode}
                aria-current={mode === "week" ? "page" : undefined}
                className={`inline-flex h-7 items-center rounded-md px-3 text-xs ${
                  mode === "week" ? "bg-primary font-semibold text-primary-foreground" : "font-medium hover:bg-muted/50"
                }`}
              >
                Weekly
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`${chipBase} border border-dashed text-muted-foreground`}>Aug 12 · upcoming</span>
            <span className={`${chipBase} border border-green-600 text-green-600`}>
              <Check className="size-3" aria-hidden />
              Aug 5 · came
            </span>
            <span className={`${chipBase} border border-destructive text-destructive`}>
              <X className="size-3" aria-hidden />
              Aug 5 · missed
            </span>
            <span className={`${chipBase} border border-amber-600 text-amber-600`}>
              <CalendarCheck className="size-3" aria-hidden />
              Aug 5
              <ArrowRight className="size-3" aria-hidden />
              Aug 9 · made up
            </span>
            <span className="text-xs text-muted-foreground">— tap a chip to mark it</span>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2.5 border-t px-6 pb-2 pt-9 text-center">
              <p className="font-serif text-xl font-semibold">The ledger is empty</p>
              <p className="max-w-[440px] text-[13px] leading-[21px] text-pretty text-muted-foreground">
                {needsSetup.length > 0
                  ? `Set ${needsSetup[0].name.split(" ")[0]}'s rate and weekly slot below and the ${periodNoun}'s lessons appear here as chips, each worth their per-lesson rate.`
                  : `Give a student a rate and a weekly slot and the ${periodNoun}'s lessons appear here as chips.`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {rows.map((row) => {
                const unpaidMissed = row.lessons.filter(
                  (lesson) => lesson.attendance === "missed" && !lesson.made_up_on,
                ).length
                return (
                  <div key={row.studentId} className="border-t py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-semibold">{row.name}</p>
                          {!row.isActive && (
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-[2px] text-[11px] font-semibold text-muted-foreground">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-muted-foreground">
                          {slotsLabel(row.slots) ?? "No weekly days set"} · {row.billing.duration_minutes} min ·{" "}
                          {formatCurrency(row.billing.rate_cents)}/lesson
                          {" · "}
                          <button
                            type="button"
                            onClick={() => setPanelStudentId(row.studentId)}
                            className="font-semibold text-accent transition-colors hover:text-accent-strong"
                          >
                            Edit rate and slot
                          </button>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-xl font-semibold leading-tight">
                          {formatCurrency(row.expectedCents)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.lessons.length} {row.lessons.length === 1 ? "lesson" : "lessons"}
                          {unpaidMissed > 0 ? ` · ${unpaidMissed} missed unpaid` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {row.lessons.map((lesson) => (
                        <AttendanceChip key={lesson.id} lesson={lesson} />
                      ))}
                      {row.lessons.length === 0 && (
                        <p className="text-sm text-muted-foreground">No lessons this {periodNoun}</p>
                      )}
                    </div>
                  </div>
                )
              })}
              <div className="flex items-baseline justify-end gap-3 border-t pt-4">
                <span className="text-[13px] text-muted-foreground">This {periodNoun} adds up to</span>
                <span className="font-serif text-[22px] font-semibold leading-none">
                  {formatCurrency(stats.expectedCents)}
                </span>
              </div>
            </div>
          )}
        </AdminCard>
      )}

      {needsSetup.length > 0 && (
        <AdminCard className="flex flex-col gap-1.5 pb-6">
          <Eyebrow>Needs a rate and slot</Eyebrow>
          <p className="mb-2 text-[13px] text-muted-foreground">
            Until these are set, lessons don&apos;t generate and income stays at zero.
          </p>
          <div className="flex flex-col gap-2.5">
            {needsSetup.map((student) => {
              const missing: string[] = []
              if (!student.billing || student.billing.rate_cents <= 0) missing.push("no rate")
              if (student.slots.length === 0) {
                missing.push("no weekly days")
              }
              const duration = student.billing?.duration_minutes ?? student.preferred_lesson_duration
              return (
                <div key={student.id} className="flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[13px] font-semibold text-accent-strong">
                    {initials(student.name)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[15px] font-semibold">{student.name}</span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {[
                        student.experience_level ? experienceLabel(student.experience_level) : null,
                        `${duration} min`,
                        missing.join(", "),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    className="h-9 rounded-lg text-[13px] font-semibold"
                    onClick={() => setPanelStudentId(student.id)}
                  >
                    Set rate and slot
                  </Button>
                </div>
              )
            })}
          </div>
        </AdminCard>
      )}

      {/* Make-up dialog */}
      <Dialog open={makeupLesson !== null} onOpenChange={(open) => !open && setMakeupLesson(null)}>
        <DialogContent className="max-w-sm rounded-2xl border-border bg-card p-7 shadow-2xl">
          {makeupLesson && (
            <form onSubmit={handleSaveMakeup} className="flex flex-col gap-5">
              <DialogHeader className="gap-1.5 text-left">
                <DialogTitle className="font-serif text-2xl font-bold">Was it made up?</DialogTitle>
                <DialogDescription className="text-[13px] text-muted-foreground">
                  Missed on {lessonDateLabel(makeupLesson.start_time)}. Recording a make-up day counts the lesson as
                  paid again.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="made_up_on" className="text-xs font-semibold">
                  Made up on
                </Label>
                <Input
                  id="made_up_on"
                  name="made_up_on"
                  type="date"
                  required
                  defaultValue={makeupLesson.made_up_on ?? dateKeyUtc(new Date(nowMs))}
                  className="h-[42px] rounded-lg border-border bg-background text-sm"
                />
              </div>
              {makeupError && (
                <p role="alert" aria-live="polite" className="text-sm text-destructive">
                  {makeupError}
                </p>
              )}
              <DialogFooter className="gap-2.5 border-t pt-5">
                {makeupLesson.made_up_on && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg px-4"
                    onClick={handleRemoveMakeup}
                    disabled={isSavingMakeup}
                  >
                    Remove make-up
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-lg px-4"
                  onClick={() => setMakeupLesson(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingMakeup} className="h-10 rounded-lg px-[18px] font-semibold">
                  {isSavingMakeup ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <StudentPanel student={panelStudent} teachers={teachers} onClose={() => setPanelStudentId(null)} />
    </div>
  )
}
