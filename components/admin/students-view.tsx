"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Plus, Search } from "lucide-react"
import { AdminCard, DashedButton, Eyebrow, PageHeader } from "@/components/admin/ui"
import { StudentPanel, type PanelStudent } from "@/components/admin/student-panel"
import { StudentFormDialog } from "@/components/admin/student-form-dialog"
import type { Teacher } from "@/lib/types"
import { initials, slotsLabel } from "@/lib/admin/format"
import { formatCurrency, experienceLabel } from "@/lib/portal/format"

interface StudentsViewProps {
  students: PanelStudent[]
  teachers: Teacher[]
}

export function StudentsView({ students, teachers }: StudentsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [panelStudentId, setPanelStudentId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<PanelStudent | null>(null)

  // Resolve from props so a router.refresh() after save shows fresh data in the panel.
  const panelStudent = students.find((student) => student.id === panelStudentId) ?? null

  const query = searchQuery.trim().toLowerCase()
  const filtered = students.filter((student) => {
    if (!query) return true
    return (
      student.name.toLowerCase().includes(query) ||
      student.profile?.full_name?.toLowerCase().includes(query) ||
      student.profile?.phone?.toLowerCase().includes(query) ||
      student.contact_name?.toLowerCase().includes(query) ||
      student.contact_phone?.toLowerCase().includes(query)
    )
  })

  const activeStudents = filtered.filter((student) => student.is_active)
  const inactiveStudents = filtered.filter((student) => !student.is_active)
  const allActive = students.filter((student) => student.is_active)

  const weeklyLessons = allActive.reduce((sum, student) => sum + student.slots.length, 0)
  const teacherCount = new Set(
    allActive
      .flatMap((student) =>
        student.slots.length > 0
          ? student.slots.map((slot) => slot.teacher_id ?? student.teacher_id)
          : [student.teacher_id],
      )
      .filter(Boolean),
  ).size

  const summary =
    allActive.length === 0
      ? "No students yet · approve an inquiry or add one by hand"
      : `${allActive.length} enrolled · ${weeklyLessons} ${weeklyLessons === 1 ? "lesson" : "lessons"} a week${
          teacherCount > 0 ? ` with ${teacherCount} ${teacherCount === 1 ? "teacher" : "teachers"}` : ""
        }`

  function openAddForm() {
    setEditingStudent(null)
    setFormOpen(true)
  }

  function openEditForm(student: PanelStudent) {
    setEditingStudent(student)
    setFormOpen(true)
  }

  function StudentRowButton({ student, isLast }: { student: PanelStudent; isLast: boolean }) {
    const guardian = student.profile?.full_name || student.contact_name || null
    const duration = student.billing?.duration_minutes ?? student.preferred_lesson_duration
    // Every teacher the student actually studies with: slot teachers (falling
    // back to the default) — or the default alone when no slots are set.
    const teacherIds =
      student.slots.length > 0
        ? [...new Set(student.slots.map((slot) => slot.teacher_id ?? student.teacher_id))]
        : [student.teacher_id]
    const teacherName =
      teacherIds
        .map((id) => teachers.find((teacher) => teacher.id === id)?.name)
        .filter(Boolean)
        .join(" · ") || null
    const slotLabel = slotsLabel(student.slots)
    const rateLabel = student.billing && student.billing.rate_cents > 0 ? formatCurrency(student.billing.rate_cents) : null

    return (
      <button
        type="button"
        onClick={() => setPanelStudentId(student.id)}
        className={`flex w-full items-center gap-4 py-[18px] text-left transition-colors hover:bg-muted/30 ${
          isLast ? "" : "border-b"
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
              teacherName,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <span className="hidden min-w-0 flex-[1.3] flex-col gap-[3px] lg:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Guardian</span>
          <span className="truncate text-sm">{guardian || "—"}</span>
        </span>
        <span className="hidden min-w-0 flex-[1.3] flex-col gap-[3px] sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Weekly slot
          </span>
          {slotLabel ? (
            <span className="truncate text-sm">{slotLabel}</span>
          ) : (
            <span className="truncate text-sm font-semibold text-accent">Set day and time</span>
          )}
        </span>
        <span className="hidden min-w-0 flex-1 flex-col gap-[3px] sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Rate</span>
          {rateLabel ? (
            <span className="truncate text-sm">{rateLabel}</span>
          ) : (
            <span className="truncate text-sm font-semibold text-accent">Set rate</span>
          )}
        </span>
        <span
          className={`inline-flex shrink-0 items-center rounded-md px-2.5 py-[3px] text-[11px] font-semibold ${
            student.is_active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {student.is_active ? "Active" : "Inactive"}
        </span>
        <ChevronRight className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Students"
        summary={summary}
        actions={
          <>
            <div className="relative w-full max-w-[264px]">
              <Search
                className="absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search students"
                aria-label="Search students"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-lg border-border bg-card pl-9 text-sm"
              />
            </div>
            <Button className="h-10 gap-2 rounded-lg px-[18px] text-sm font-semibold" onClick={openAddForm}>
              <Plus className="size-4" aria-hidden />
              Add student
            </Button>
          </>
        }
      />

      <AdminCard className="flex flex-col pb-6">
        <Eyebrow className="mb-1.5">Enrolled</Eyebrow>

        {activeStudents.length > 0 ? (
          activeStudents.map((student, index) => (
            <StudentRowButton key={student.id} student={student} isLast={index === activeStudents.length - 1} />
          ))
        ) : query ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No students match “{searchQuery}”.</p>
        ) : null}

        {!query && (
          <div className={`flex flex-col items-center gap-3 pb-2 text-center ${activeStudents.length > 0 ? "pt-11" : "pt-8"}`}>
            <p className="font-serif text-xl font-semibold">
              {activeStudents.length > 0 ? "Room to grow" : "No students yet"}
            </p>
            <p className="max-w-[420px] text-[13px] leading-[21px] text-pretty text-muted-foreground">
              Approve an inquiry and the family lands here automatically — or add a student you teach off the website.
            </p>
            <DashedButton className="mt-1" onClick={openAddForm}>
              <Plus className="size-3.5" aria-hidden />
              Add student
            </DashedButton>
          </div>
        )}
      </AdminCard>

      {inactiveStudents.length > 0 && (
        <AdminCard className="flex flex-col pb-6">
          <Eyebrow className="mb-1.5">Inactive</Eyebrow>
          {inactiveStudents.map((student, index) => (
            <StudentRowButton key={student.id} student={student} isLast={index === inactiveStudents.length - 1} />
          ))}
        </AdminCard>
      )}

      <StudentPanel
        student={panelStudent}
        teachers={teachers}
        onClose={() => setPanelStudentId(null)}
        onEditDetails={(student) => {
          setPanelStudentId(null)
          openEditForm(student)
        }}
      />

      <StudentFormDialog open={formOpen} onOpenChange={setFormOpen} student={editingStudent} teachers={teachers} />
    </div>
  )
}
