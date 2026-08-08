"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { AdminCard, EmptyState, Eyebrow, NavSquareLink, PageHeader } from "@/components/admin/ui"
import { StudentPanel, type PanelStudent } from "@/components/admin/student-panel"
import { TeacherFormDialog } from "@/components/admin/teacher-form-dialog"
import { WeekBands, type WeekBandDay } from "@/components/admin/week-bands"
import type { Teacher } from "@/lib/types"
import { formatCurrencyCompact, initials, slotsLabel } from "@/lib/admin/format"
import { formatCurrency, experienceLabel } from "@/lib/portal/format"

export interface RosterRow {
  studentId: string
  weeklyGrossCents: number
  weeklyPayCents: number
  monthGrossCents: number
  monthMissedCount: number
}

export interface TeacherMonthActuals {
  grossCents: number
  payCents: number
  profitCents: number
  lessonCount: number
}

interface TeacherDetailViewProps {
  teacher: Teacher
  teachers: Teacher[]
  /** Assigned students (active first), full rows for the student panel. */
  students: PanelStudent[]
  roster: RosterRow[]
  weekDays: WeekBandDay[]
  hourLabels: string[]
  summary: string
  hrefs: { prev: string; current: string; next: string }
  monthName: string
  monthActuals: TeacherMonthActuals
}

export function TeacherDetailView({
  teacher,
  teachers,
  students,
  roster,
  weekDays,
  hourLabels,
  summary,
  hrefs,
  monthName,
  monthActuals,
}: TeacherDetailViewProps) {
  const [panelStudentId, setPanelStudentId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const panelStudent = students.find((student) => student.id === panelStudentId) ?? null
  const rosterByStudent = new Map(roster.map((row) => [row.studentId, row]))
  const activeStudents = students.filter((student) => student.is_active)

  const totals = roster.reduce(
    (acc, row) => ({
      gross: acc.gross + row.weeklyGrossCents,
      pay: acc.pay + row.weeklyPayCents,
    }),
    { gross: 0, pay: 0 },
  )

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title={teacher.name}
        summary={summary}
        actions={
          <>
            <div className="flex items-center gap-2">
              <NavSquareLink href={hrefs.prev} ariaLabel="Previous week">
                <ChevronLeft className="size-4" aria-hidden />
              </NavSquareLink>
              <Link
                href={hrefs.current}
                className="inline-flex h-[38px] items-center rounded-lg border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted/50"
              >
                This week
              </Link>
              <NavSquareLink href={hrefs.next} ariaLabel="Next week">
                <ChevronRight className="size-4" aria-hidden />
              </NavSquareLink>
            </div>
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-medium"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" aria-hidden />
              Edit teacher
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 overflow-hidden rounded-xl border bg-card shadow-sm sm:grid-cols-3">
        {[
          {
            label: "Pay rate",
            value: `${formatCurrencyCompact(teacher.pay_hourly_cents)}/hr`,
            footnote: `Pay per lesson = hourly × duration — ${formatCurrencyCompact(Math.round(teacher.pay_hourly_cents / 2))} per 30 min`,
            accent: false,
          },
          {
            label: `Pay in ${monthName}`,
            value: formatCurrency(monthActuals.payCents),
            footnote: `${monthActuals.lessonCount} ${monthActuals.lessonCount === 1 ? "lesson counts" : "lessons count"} · missed without make-up pays nothing`,
            accent: false,
          },
          {
            label: `Your profit in ${monthName}`,
            value: formatCurrency(monthActuals.profitCents),
            footnote: `${formatCurrency(monthActuals.grossCents)} gross minus pay`,
            accent: true,
          },
        ].map((cell, index) => (
          <div
            key={cell.label}
            className={`flex flex-col gap-2 px-6 py-5 ${index > 0 ? "border-t sm:border-l sm:border-t-0" : ""}`}
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

      <AdminCard className="flex flex-col pb-6">
        <Eyebrow className="mb-1.5">Roster</Eyebrow>
        {activeStudents.length === 0 ? (
          <EmptyState title="No students yet">
            Open a student on the Students page and pick {teacher.name} as their teacher — their weekly lessons land
            on this calendar automatically.
          </EmptyState>
        ) : (
          <>
            {activeStudents.map((student, index) => {
              const row = rosterByStudent.get(student.id)
              const duration = student.billing?.duration_minutes ?? student.preferred_lesson_duration
              const guardian = student.profile?.full_name || student.contact_name || null
              const email = student.contact_email || null
              const slotLabel = slotsLabel(student.slots)
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setPanelStudentId(student.id)}
                  className={`flex w-full items-center gap-4 py-[18px] text-left transition-colors hover:bg-muted/30 ${
                    index === activeStudents.length - 1 ? "" : "border-b"
                  }`}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent-strong">
                    {initials(student.name)}
                  </span>
                  <span className="flex min-w-0 flex-[1.7] flex-col gap-[3px]">
                    <span className="truncate font-serif text-[19px] font-semibold">{student.name}</span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {[
                        student.experience_level ? experienceLabel(student.experience_level) : null,
                        `${duration} min`,
                        student.billing && student.billing.rate_cents > 0
                          ? `${formatCurrency(student.billing.rate_cents)}/lesson`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="hidden min-w-0 flex-[1.4] flex-col gap-[3px] lg:flex">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Guardian
                    </span>
                    <span className="truncate text-sm">{guardian || "—"}</span>
                    {email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
                  </span>
                  <span className="hidden min-w-0 flex-[1.2] flex-col gap-[3px] sm:flex">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Days
                    </span>
                    {slotLabel ? (
                      <span className="truncate text-sm">{slotLabel}</span>
                    ) : (
                      <span className="truncate text-sm font-semibold text-accent">Set day and time</span>
                    )}
                  </span>
                  <span className="hidden min-w-0 flex-1 flex-col gap-[3px] sm:flex">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Weekly gross
                    </span>
                    <span className="truncate text-sm">{formatCurrency(row?.weeklyGrossCents ?? 0)}</span>
                  </span>
                  <span className="hidden min-w-0 flex-1 flex-col gap-[3px] sm:flex">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {monthName}
                    </span>
                    <span className="truncate text-sm">
                      {formatCurrency(row?.monthGrossCents ?? 0)}
                      {row && row.monthMissedCount > 0 ? ` · ${row.monthMissedCount} missed` : ""}
                    </span>
                  </span>
                </button>
              )
            })}
            <div className="flex flex-wrap items-baseline justify-end gap-x-5 gap-y-1 border-t pt-4">
              <span className="text-[13px] text-muted-foreground">Planned each week:</span>
              <span className="text-sm">
                {formatCurrency(totals.gross)} gross · {formatCurrency(totals.pay)} pay
              </span>
              <span className="font-serif text-[22px] font-semibold leading-none">
                {formatCurrency(totals.gross - totals.pay)}
              </span>
              <span className="text-[13px] text-muted-foreground">your profit</span>
            </div>
          </>
        )}
      </AdminCard>

      <WeekBands eyebrow="This week" hourLabels={hourLabels} days={weekDays} />

      <StudentPanel student={panelStudent} teachers={teachers} onClose={() => setPanelStudentId(null)} />
      <TeacherFormDialog open={editOpen} onOpenChange={setEditOpen} teacher={teacher} />
    </div>
  )
}
