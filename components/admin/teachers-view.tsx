"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Plus } from "lucide-react"
import { AdminCard, DashedButton, EmptyState, Eyebrow, PageHeader } from "@/components/admin/ui"
import { TeacherFormDialog } from "@/components/admin/teacher-form-dialog"
import type { Teacher } from "@/lib/types"
import { formatCurrencyCompact, initials } from "@/lib/admin/format"
import { formatCurrency } from "@/lib/portal/format"

export interface TeacherSummaryRow {
  teacher: Teacher
  studentCount: number
  weeklyGrossCents: number
  weeklyPayCents: number
  weeklyProfitCents: number
}

export interface MonthTotals {
  grossCents: number
  payCents: number
  profitCents: number
  lessonCount: number
}

interface TeachersViewProps {
  rows: TeacherSummaryRow[]
  monthTotals: MonthTotals
  monthName: string
}

export function TeachersView({ rows, monthTotals, monthName }: TeachersViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)

  const activeRows = rows.filter((row) => row.teacher.is_active)
  const inactiveRows = rows.filter((row) => !row.teacher.is_active)
  const weeklyGrossTotal = activeRows.reduce((sum, row) => sum + row.weeklyGrossCents, 0)

  const summary =
    rows.length === 0
      ? "Add your faculty · every teacher gets a calendar and a pay report"
      : `${activeRows.length} ${activeRows.length === 1 ? "teacher" : "teachers"} · ${formatCurrencyCompact(weeklyGrossTotal)} gross per week planned`

  function openAdd() {
    setEditingTeacher(null)
    setDialogOpen(true)
  }

  function TeacherRow({ row, isLast }: { row: TeacherSummaryRow; isLast: boolean }) {
    return (
      <Link
        href={`/admin/teachers/${row.teacher.id}`}
        className={`flex items-center gap-4 py-[18px] transition-colors hover:bg-muted/30 ${isLast ? "" : "border-b"}`}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent-strong">
          {initials(row.teacher.name)}
        </span>
        <span className="flex min-w-0 flex-[1.7] flex-col gap-[3px]">
          <span className="truncate font-serif text-[19px] font-semibold">{row.teacher.name}</span>
          <span className="truncate text-[13px] text-muted-foreground">
            {[
              row.teacher.instrument,
              `${row.studentCount} ${row.studentCount === 1 ? "student" : "students"}`,
              `${formatCurrencyCompact(row.teacher.pay_hourly_cents)}/hr`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <span className="hidden min-w-0 flex-1 flex-col gap-[3px] sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Weekly gross
          </span>
          <span className="truncate text-sm">{formatCurrency(row.weeklyGrossCents)}</span>
        </span>
        <span className="hidden min-w-0 flex-1 flex-col gap-[3px] sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Weekly pay
          </span>
          <span className="truncate text-sm">{formatCurrency(row.weeklyPayCents)}</span>
        </span>
        <span className="hidden min-w-0 flex-1 flex-col gap-[3px] sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your profit
          </span>
          <span className="truncate text-sm font-semibold">{formatCurrency(row.weeklyProfitCents)}</span>
        </span>
        <span
          className={`inline-flex shrink-0 items-center rounded-md px-2.5 py-[3px] text-[11px] font-semibold ${
            row.teacher.is_active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {row.teacher.is_active ? "Active" : "Inactive"}
        </span>
        <ChevronRight className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Teachers"
        summary={summary}
        actions={
          <Button className="h-10 gap-2 rounded-lg px-[18px] text-sm font-semibold" onClick={openAdd}>
            <Plus className="size-4" aria-hidden />
            Add teacher
          </Button>
        }
      />

      {rows.length > 0 && (
        <div className="grid grid-cols-1 overflow-hidden rounded-xl border bg-card shadow-sm sm:grid-cols-3">
          {[
            {
              label: `Gross in ${monthName}`,
              value: formatCurrency(monthTotals.grossCents),
              footnote: `${monthTotals.lessonCount} ${monthTotals.lessonCount === 1 ? "lesson counts" : "lessons count"} so far`,
              accent: false,
            },
            {
              label: `Teacher pay in ${monthName}`,
              value: formatCurrency(monthTotals.payCents),
              footnote: "Missed without make-up pays nothing",
              accent: false,
            },
            {
              label: `Your profit in ${monthName}`,
              value: formatCurrency(monthTotals.profitCents),
              footnote: "Gross minus teacher pay",
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
      )}

      <AdminCard className="flex flex-col pb-6">
        <Eyebrow className="mb-1.5">Faculty</Eyebrow>
        {activeRows.length > 0 ? (
          activeRows.map((row, index) => (
            <TeacherRow key={row.teacher.id} row={row} isLast={index === activeRows.length - 1} />
          ))
        ) : (
          <EmptyState
            title="No teachers yet"
            cta={
              <DashedButton onClick={openAdd}>
                <Plus className="size-3.5" aria-hidden />
                Add the first teacher
              </DashedButton>
            }
          >
            Add each teacher with their hourly pay, assign them students from the student panel, and their
            calendar, roster and pay report appear here on their own.
          </EmptyState>
        )}
      </AdminCard>

      {inactiveRows.length > 0 && (
        <AdminCard className="flex flex-col pb-6">
          <Eyebrow className="mb-1.5">Inactive</Eyebrow>
          {inactiveRows.map((row, index) => (
            <div key={row.teacher.id}>
              <TeacherRow row={row} isLast={index === inactiveRows.length - 1} />
              {row.studentCount > 0 && (
                <p className="pb-3 text-[13px] font-medium text-accent-strong">
                  {row.studentCount} {row.studentCount === 1 ? "student is" : "students are"} still assigned — move
                  them to another teacher from their student panels.
                </p>
              )}
            </div>
          ))}
        </AdminCard>
      )}

      <TeacherFormDialog open={dialogOpen} onOpenChange={setDialogOpen} teacher={editingTeacher} />
    </div>
  )
}
