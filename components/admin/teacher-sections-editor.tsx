"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { DashedButton } from "@/components/admin/ui"
import { DAY_NAMES } from "@/lib/admin/format"
import type { StudentBilling, StudentSlot, Teacher } from "@/lib/types"

const fieldClass = "h-[42px] rounded-lg border-border bg-background text-sm"

interface SectionRow {
  day: string
  time: string
}

export interface TeacherSection {
  /** Teacher UUID; "" = slots that have no teacher (legacy data). */
  teacherId: string
  duration: string
  rate: string
  rows: SectionRow[]
}

/**
 * A student's existing teachers/slots as editor sections: slots group by
 * their effective teacher (slot override, else the student's default), and a
 * default teacher with no slots yet still gets a section so the assignment
 * isn't lost on save. Section rate/duration seed from the group's first slot,
 * else the standing billing.
 */
export function sectionsFromStudent(student: {
  teacher_id: string | null
  billing: StudentBilling | null
  slots: StudentSlot[]
}): TeacherSection[] {
  const billingRate = student.billing ? (student.billing.rate_cents / 100).toFixed(2) : ""
  const billingDuration = String(student.billing?.duration_minutes ?? 30)

  const groups = new Map<string, StudentSlot[]>()
  for (const slot of student.slots) {
    const key = slot.teacher_id ?? student.teacher_id ?? ""
    groups.set(key, [...(groups.get(key) ?? []), slot])
  }
  if (groups.size === 0) {
    if (!student.teacher_id) return []
    return [{ teacherId: student.teacher_id, duration: billingDuration, rate: billingRate, rows: [] }]
  }
  return [...groups.entries()].map(([teacherId, slots]) => {
    const sorted = slots.slice().sort((a, b) => a.day_of_week - b.day_of_week)
    const first = sorted[0]
    return {
      teacherId,
      duration: String(first.duration_minutes ?? student.billing?.duration_minutes ?? 30),
      rate:
        first.rate_cents != null
          ? (first.rate_cents / 100).toFixed(2)
          : billingRate,
      rows: sorted.map((slot) => ({ day: String(slot.day_of_week), time: slot.lesson_time.slice(0, 5) })),
    }
  })
}

/**
 * Multi-teacher setup shared by the add-student dialog and the student
 * panel: toggle the teacher(s) the student studies with, and each selected
 * teacher opens a section for that teacher's weekly days, lesson length, and
 * rate. Serializes to a hidden `sections` JSON field — the first section
 * doubles as the student's default teacher and standing billing on the
 * server.
 */
export function TeacherSectionsEditor({
  teachers,
  initialSections = [],
}: {
  teachers: Teacher[]
  initialSections?: TeacherSection[]
}) {
  const [sections, setSections] = useState<TeacherSection[]>(initialSections)
  // Offer active teachers, plus any the student already has even if inactive.
  const selectable = teachers.filter(
    (teacher) => teacher.is_active || sections.some((section) => section.teacherId === teacher.id),
  )
  const usedDays = new Set(sections.flatMap((section) => section.rows.map((row) => row.day)).filter(Boolean))
  const totalRows = sections.reduce((sum, section) => sum + section.rows.length, 0)

  const serialized = JSON.stringify(
    sections.map((section) => ({
      teacher: section.teacherId,
      duration: section.duration,
      rate: section.rate,
      rows: section.rows.filter((row) => row.day !== "" && row.time !== ""),
    })),
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
      <input type="hidden" name="sections" value={serialized} />
      <div className="flex flex-col gap-[7px]">
        <span className="text-xs font-semibold">Teacher(s)</span>
        <div className="flex flex-wrap gap-2">
          {selectable.map((teacher) => {
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
                {teacher.is_active ? "" : " (inactive)"}
              </button>
            )
          })}
        </div>
        {sections.length === 0 && (
          <p className="text-xs leading-[18px] text-muted-foreground">
            Pick one or more teachers to set weekly days — lessons won&apos;t generate without them.
          </p>
        )}
      </div>

      {sections.map((section) => {
        const teacher = teachers.find((item) => item.id === section.teacherId)
        const heading = teacher ? `Lessons with ${teacher.name}` : "Lessons without a teacher"
        return (
          <div key={section.teacherId || "none"} className="flex flex-col gap-3 rounded-lg border p-3.5">
            <span className="text-[13px] font-semibold">{heading}</span>
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
                      aria-label={`Lesson day ${index + 1} — ${heading}`}
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
                    aria-label={`Lesson time ${index + 1} — ${heading}`}
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
                    aria-label={`Remove day ${index + 1} — ${heading}`}
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
