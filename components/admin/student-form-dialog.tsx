"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, X } from "lucide-react"
import { createStudent, updateStudent } from "@/app/admin/students/actions"
import type { PanelStudent } from "@/components/admin/student-panel"
import { DashedButton } from "@/components/admin/ui"
import { DAY_NAMES } from "@/lib/admin/format"
import type { Teacher } from "@/lib/types"

interface StudentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = add a new student. */
  student: PanelStudent | null
  teachers: Teacher[]
}

const fieldClass = "h-[42px] rounded-lg border-border bg-background text-sm"

interface SectionRow {
  day: string
  time: string
}

interface TeacherSection {
  teacherId: string
  duration: string
  rate: string
  rows: SectionRow[]
}

/**
 * Create-mode teacher setup: toggle the teacher(s) the student studies with,
 * and each selected teacher opens a section for that teacher's weekly days,
 * lesson length, and rate. Serializes to the same hidden `slots` JSON the
 * student panel uses — every slot carries its teacher explicitly.
 */
function TeacherSectionsEditor({ teachers }: { teachers: Teacher[] }) {
  const [sections, setSections] = useState<TeacherSection[]>([])
  const activeTeachers = teachers.filter((teacher) => teacher.is_active)
  const usedDays = new Set(sections.flatMap((section) => section.rows.map((row) => row.day)).filter(Boolean))
  const totalRows = sections.reduce((sum, section) => sum + section.rows.length, 0)

  const serialized = JSON.stringify(
    sections.flatMap((section) =>
      section.rows
        .filter((row) => row.day !== "" && row.time !== "")
        .map((row) => ({
          day: Number(row.day),
          time: row.time,
          teacher: section.teacherId,
          duration: section.duration,
          rate: section.rate,
        })),
    ),
  )

  function toggleTeacher(teacherId: string) {
    setSections((prev) =>
      prev.some((section) => section.teacherId === teacherId)
        ? prev.filter((section) => section.teacherId !== teacherId)
        : [...prev, { teacherId, duration: "30", rate: "", rows: [{ day: "", time: "" }] }],
    )
  }

  function updateSection(teacherId: string, patch: Partial<TeacherSection>) {
    setSections((prev) =>
      prev.map((section) => (section.teacherId === teacherId ? { ...section, ...patch } : section)),
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="slots" value={serialized} />
      <div className="flex flex-col gap-[7px]">
        <span className="text-xs font-semibold">Teacher(s)</span>
        <div className="flex flex-wrap gap-2">
          {activeTeachers.map((teacher) => {
            const selected = sections.some((section) => section.teacherId === teacher.id)
            return (
              <button
                key={teacher.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTeacher(teacher.id)}
                className={`rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {teacher.name}
              </button>
            )
          })}
        </div>
        {sections.length === 0 && (
          <p className="text-xs leading-[18px] text-muted-foreground">
            Pick one or more teachers to set weekly days now — or add the student and do it later from their panel.
          </p>
        )}
      </div>

      {sections.map((section) => {
        const teacher = teachers.find((item) => item.id === section.teacherId)
        return (
          <div key={section.teacherId} className="flex flex-col gap-3 rounded-lg border p-3.5">
            <span className="text-[13px] font-semibold">Lessons with {teacher?.name ?? "teacher"}</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor={`duration-${section.teacherId}`} className="text-xs font-semibold">
                  Lesson length
                </Label>
                <Select
                  value={section.duration}
                  onValueChange={(value) => updateSection(section.teacherId, { duration: value })}
                >
                  <SelectTrigger id={`duration-${section.teacherId}`} className={`${fieldClass} w-full`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor={`rate-${section.teacherId}`} className="text-xs font-semibold">
                  Rate per lesson (dollars)
                </Label>
                <Input
                  id={`rate-${section.teacherId}`}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="45.00"
                  value={section.rate}
                  onChange={(e) => updateSection(section.teacherId, { rate: e.target.value })}
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {section.rows.map((row, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <Select
                    value={row.day}
                    onValueChange={(value) =>
                      updateSection(section.teacherId, {
                        rows: section.rows.map((item, i) => (i === index ? { ...item, day: value } : item)),
                      })
                    }
                  >
                    <SelectTrigger
                      aria-label={`Lesson day ${index + 1} with ${teacher?.name ?? "teacher"}`}
                      className={`${fieldClass} flex-[1.3]`}
                    >
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_NAMES.map((day, dayIndex) => (
                        <SelectItem
                          key={day}
                          value={String(dayIndex)}
                          disabled={usedDays.has(String(dayIndex)) && row.day !== String(dayIndex)}
                        >
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="time"
                    aria-label={`Lesson time ${index + 1} with ${teacher?.name ?? "teacher"}`}
                    value={row.time}
                    onChange={(e) =>
                      updateSection(section.teacherId, {
                        rows: section.rows.map((item, i) => (i === index ? { ...item, time: e.target.value } : item)),
                      })
                    }
                    className={`${fieldClass} flex-1`}
                  />
                  <button
                    type="button"
                    aria-label={`Remove day ${index + 1} with ${teacher?.name ?? "teacher"}`}
                    onClick={() =>
                      updateSection(section.teacherId, { rows: section.rows.filter((_, i) => i !== index) })
                    }
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
              {totalRows < 7 && (
                <DashedButton
                  className="w-fit"
                  onClick={() => updateSection(section.teacherId, { rows: [...section.rows, { day: "", time: "" }] })}
                >
                  <Plus className="size-3.5" aria-hidden />
                  Add a day
                </DashedButton>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Add / edit student details — name, level, guardian contact, plus optional billing on create. */
export function StudentFormDialog({ open, onOpenChange, student, teachers }: StudentFormDialogProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    const result = student ? await updateStudent(student.id, formData) : await createStudent(formData)
    if (result?.error) {
      setFormError(result.error)
      setIsSaving(false)
      return
    }
    router.refresh()
    setIsSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[520px] overflow-y-auto rounded-2xl border-border bg-card p-7 shadow-2xl">
        <form key={student?.id ?? "new"} onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="font-serif text-2xl font-bold">
              {student ? `Edit ${student.name}` : "Add student"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Only the name is required — everything else can be filled in later.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="student-name" className="text-xs font-semibold">
                  Student name
                </Label>
                <Input id="student-name" name="name" required defaultValue={student?.name ?? ""} className={fieldClass} />
              </div>
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="student-level" className="text-xs font-semibold">
                  Experience level
                </Label>
                <Select name="experience_level" defaultValue={student?.experience_level ?? "none"}>
                  <SelectTrigger id="student-level" className={`${fieldClass} w-full`}>
                    <SelectValue placeholder="Not specified" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="student-guardian" className="text-xs font-semibold">
                  Parent / guardian name
                </Label>
                <Input
                  id="student-guardian"
                  name="contact_name"
                  defaultValue={student?.contact_name ?? ""}
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="student-phone" className="text-xs font-semibold">
                  Phone
                </Label>
                <Input
                  id="student-phone"
                  name="contact_phone"
                  type="tel"
                  autoComplete="tel"
                  defaultValue={student?.contact_phone ?? ""}
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="flex flex-col gap-[7px]">
              <Label htmlFor="student-email" className="text-xs font-semibold">
                Parent / guardian email
              </Label>
              <Input
                id="student-email"
                name="contact_email"
                type="email"
                autoComplete="email"
                defaultValue={student?.contact_email ?? ""}
                className={fieldClass}
              />
            </div>
            {student ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-[7px]">
                  <Label htmlFor="student-duration" className="text-xs font-semibold">
                    Lesson duration
                  </Label>
                  <Select
                    name="duration"
                    defaultValue={String(student.billing?.duration_minutes ?? student.preferred_lesson_duration ?? 30)}
                  >
                    <SelectTrigger id="student-duration" className={`${fieldClass} w-full`}>
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
            ) : (
              <TeacherSectionsEditor teachers={teachers} />
            )}
            {formError && (
              <p role="alert" aria-live="polite" className="text-sm text-destructive">
                {formError}
              </p>
            )}
            <p className="text-xs leading-[18px] text-muted-foreground">
              {student
                ? "Teachers, rates and weekly days are edited from the student panel — this dialog covers the details."
                : "Each teacher's section sets that teacher's days, length, and rate for this student. Everything can be changed later from the student panel."}
            </p>
          </div>

          <DialogFooter className="gap-2.5 border-t pt-5">
            <Button type="button" variant="outline" className="h-10 rounded-lg px-4" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="h-10 rounded-lg px-[18px] font-semibold">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : student ? "Save changes" : "Add student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
