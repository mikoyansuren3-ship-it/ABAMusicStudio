"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Loader2, X } from "lucide-react"
import type { Profile, Student, StudentBilling, StudentSlot, Teacher } from "@/lib/types"
import { saveStudentPanel, toggleStudentActive } from "@/app/admin/students/actions"
import { Eyebrow } from "@/components/admin/ui"
import { initials } from "@/lib/admin/format"
import { experienceLabel } from "@/lib/portal/format"
import { TeacherSectionsEditor, sectionsFromStudent } from "@/components/admin/teacher-sections-editor"

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
                <Eyebrow>Teachers and weekly days</Eyebrow>
                <TeacherSectionsEditor teachers={teachers} initialSections={sectionsFromStudent(student)} />
                <p className="text-xs leading-[18px] text-muted-foreground">
                  Lessons repeat weekly on each chosen day. The first teacher listed is the student&apos;s default.
                  Changes apply from the current month forward — upcoming lessons move to the right teacher and rate;
                  past months stay with whoever taught them.
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
