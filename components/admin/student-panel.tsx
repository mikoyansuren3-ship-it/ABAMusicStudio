"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Loader2, Plus, X } from "lucide-react"
import type { Profile, Student, StudentBilling, StudentSlot, Teacher } from "@/lib/types"
import { saveStudentPanel, toggleStudentActive } from "@/app/admin/students/actions"
import { DashedButton, Eyebrow } from "@/components/admin/ui"
import { DAY_NAMES, initials } from "@/lib/admin/format"
import { experienceLabel } from "@/lib/portal/format"

export type PanelStudent = Student & {
  profile: Profile | null
  billing: StudentBilling | null
  slots: StudentSlot[]
}

interface StudentPanelProps {
  student: PanelStudent | null
  teachers: Teacher[]
  onClose: () => void
  /** Optional hook to open the full edit-details dialog (name, level, guardian, phone). */
  onEditDetails?: (student: PanelStudent) => void
}

interface SlotRow {
  day: string
  time: string
}

/**
 * Weekly slot rows (day + time, one per weekday). Lives inside the keyed
 * <form> so its state resets when the panel switches students. Serializes to
 * a hidden `slots` JSON field for saveStudentPanel.
 */
function SlotsEditor({ initialSlots }: { initialSlots: StudentSlot[] }) {
  const [rows, setRows] = useState<SlotRow[]>(() =>
    initialSlots
      .slice()
      .sort((a, b) => a.day_of_week - b.day_of_week)
      .map((slot) => ({ day: String(slot.day_of_week), time: slot.lesson_time.slice(0, 5) })),
  )

  const serialized = JSON.stringify(
    rows
      .filter((row) => row.day !== "" && row.time !== "")
      .map((row) => ({ day: Number(row.day), time: row.time })),
  )
  const usedDays = new Set(rows.map((row) => row.day))

  function updateRow(index: number, patch: Partial<SlotRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  return (
    <div className="flex flex-col gap-2.5">
      <input type="hidden" name="slots" value={serialized} />
      {rows.length === 0 && (
        <p className="text-[13px] text-muted-foreground">No weekly days yet — lessons won&apos;t generate.</p>
      )}
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2.5">
          <Select value={row.day} onValueChange={(value) => updateRow(index, { day: value })}>
            <SelectTrigger aria-label={`Lesson day ${index + 1}`} className={`${fieldClass} flex-[1.3]`}>
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
            aria-label={`Lesson time ${index + 1}`}
            value={row.time}
            onChange={(e) => updateRow(index, { time: e.target.value })}
            className={`${fieldClass} flex-1`}
          />
          <button
            type="button"
            aria-label={`Remove day ${index + 1}`}
            onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      {rows.length < 7 && (
        <DashedButton
          className="w-fit"
          onClick={() =>
            setRows((prev) => {
              const nextDay = [1, 2, 3, 4, 5, 6, 0].find((day) => !prev.some((row) => row.day === String(day)))
              return [...prev, { day: nextDay !== undefined ? String(nextDay) : "", time: "" }]
            })
          }
        >
          <Plus className="size-3.5" aria-hidden />
          Add a day
        </DashedButton>
      )}
    </div>
  )
}

const fieldClass = "h-[42px] rounded-lg border-border bg-card text-sm"

/** Right slide-over with a wood header: teacher, rate + weekly slots, internal notes, active toggle. */
export function StudentPanel({ student, teachers, onClose, onEditDetails }: StudentPanelProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isTogglingActive, setIsTogglingActive] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!student) return
    setIsSaving(true)
    setSaveError(null)
    const result = await saveStudentPanel(student.id, new FormData(e.currentTarget))
    if (result?.error) {
      setSaveError(result.error)
      setIsSaving(false)
      return
    }
    router.refresh()
    setIsSaving(false)
    onClose()
  }

  async function handleToggleActive() {
    if (!student) return
    setIsTogglingActive(true)
    await toggleStudentActive(student.id, !student.is_active)
    router.refresh()
    setIsTogglingActive(false)
    onClose()
  }

  const guardianName = student?.profile?.full_name || student?.contact_name || null
  const guardianPhone = student?.profile?.phone || student?.contact_phone || null
  const guardianEmail = student?.contact_email || null
  const duration = student?.billing?.duration_minutes ?? student?.preferred_lesson_duration ?? 30

  // Offer active teachers, plus the student's current one even if inactive.
  const teacherOptions = teachers.filter(
    (teacher) => teacher.is_active || teacher.id === student?.teacher_id,
  )

  return (
    <Sheet open={student !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[460px] max-w-[92vw] gap-0 border-border bg-background p-0 sm:max-w-[460px] [&>button.absolute]:hidden"
      >
        {student && (
          <form onSubmit={handleSave} className="flex h-full flex-col overflow-y-auto" key={student.id}>
            <div className="flex shrink-0 items-center gap-4 bg-wood-dark px-7 py-[26px]">
              <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full border border-gold bg-wood-main text-base font-semibold text-cream">
                {initials(student.name)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <SheetTitle className="truncate font-serif text-2xl font-semibold text-cream">
                  {student.name}
                </SheetTitle>
                <span className="text-xs tracking-[0.06em] text-cream/70">
                  {[
                    student.experience_level ? experienceLabel(student.experience_level) : null,
                    `${duration} min`,
                    student.is_active ? "Active" : "Inactive",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-[34px] shrink-0 items-center justify-center rounded-lg text-cream/70 transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-gold"
              >
                <X className="size-[17px]" aria-hidden />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-[22px] px-7 pb-8 pt-[26px]">
              <div className="flex flex-col gap-2">
                <Eyebrow>Guardian</Eyebrow>
                <span className="text-[15px] font-medium">{guardianName || "No guardian on file"}</span>
                <span className="text-xs leading-[18px] text-muted-foreground">
                  {[guardianPhone, guardianEmail].filter(Boolean).join(" · ")}
                  {guardianPhone || guardianEmail ? " · " : ""}
                  {student.parent_id
                    ? "Has a parent portal account — announcements and online payment reach this family."
                    : "Added by hand — no parent portal account yet, so announcements and online payment don't reach this family."}
                </span>
                {onEditDetails && (
                  <button
                    type="button"
                    onClick={() => onEditDetails(student)}
                    className="w-fit text-[13px] font-semibold text-accent transition-colors hover:text-accent-strong"
                  >
                    Edit details
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3.5 border-t pt-[22px]">
                <Eyebrow>Teacher</Eyebrow>
                <div className="flex flex-col gap-[7px]">
                  <Label htmlFor="panel-teacher" className="text-xs font-semibold">
                    Assigned teacher
                  </Label>
                  <Select name="teacher_id" defaultValue={student.teacher_id ?? "none"}>
                    <SelectTrigger id="panel-teacher" className={`${fieldClass} w-full`}>
                      <SelectValue placeholder="Not assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not assigned</SelectItem>
                      {teacherOptions.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                          {teacher.is_active ? "" : " (inactive)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs leading-[18px] text-muted-foreground">
                    Changing the teacher moves upcoming lessons to their calendar; past months stay with whoever
                    taught them.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 border-t pt-[22px]">
                <Eyebrow>Rate and weekly slots</Eyebrow>
                <div className="flex flex-wrap gap-3">
                  <div className="flex min-w-32 flex-[1.2] flex-col gap-[7px]">
                    <Label htmlFor="panel-rate" className="text-xs font-semibold">
                      Rate per lesson
                    </Label>
                    <Input
                      id="panel-rate"
                      name="rate"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="45.00"
                      defaultValue={student.billing ? (student.billing.rate_cents / 100).toFixed(2) : ""}
                      className={fieldClass}
                    />
                  </div>
                  <div className="flex min-w-28 flex-1 flex-col gap-[7px]">
                    <Label htmlFor="panel-duration" className="text-xs font-semibold">
                      Duration
                    </Label>
                    <Select name="duration" defaultValue={String(duration)}>
                      <SelectTrigger id="panel-duration" className={`${fieldClass} w-full`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-[7px]">
                  <span className="text-xs font-semibold">Lesson days</span>
                  <SlotsEditor initialSlots={student.slots} />
                </div>
                <p className="text-xs leading-[18px] text-muted-foreground">
                  Lessons repeat weekly on each chosen day. Changes apply from the current month forward, and expected
                  income starts counting.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 border-t pt-[22px]">
                <Eyebrow>Internal notes</Eyebrow>
                <Textarea
                  name="notes"
                  rows={4}
                  placeholder="Only you see these."
                  defaultValue={student.notes ?? ""}
                  aria-label="Internal notes"
                  className="rounded-lg border-border bg-card text-sm leading-5"
                />
              </div>

              {saveError && (
                <p role="alert" aria-live="polite" className="text-sm text-destructive">
                  {saveError}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-3 border-t pt-[22px]">
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={isTogglingActive}
                  className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {isTogglingActive ? "Saving…" : student.is_active ? "Mark as inactive" : "Mark as active"}
                </button>
                <div className="flex gap-2.5">
                  <Button type="button" variant="outline" className="h-10 rounded-lg px-4" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving} className="h-10 rounded-lg px-[18px] font-semibold">
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
