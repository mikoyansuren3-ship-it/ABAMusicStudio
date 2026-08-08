"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import type { Teacher } from "@/lib/types"
import { createTeacher, updateTeacher, toggleTeacherActive } from "@/app/admin/teachers/actions"

interface TeacherFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = add a new teacher. */
  teacher: Teacher | null
}

const fieldClass = "h-[42px] rounded-lg border-border bg-background text-sm"

/** Add / edit a teacher: name, instrument, hourly pay, notes; deactivate from the footer. */
export function TeacherFormDialog({ open, onOpenChange, teacher }: TeacherFormDialogProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isTogglingActive, setIsTogglingActive] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    const result = teacher ? await updateTeacher(teacher.id, formData) : await createTeacher(formData)
    if (result?.error) {
      setFormError(result.error)
      setIsSaving(false)
      return
    }
    router.refresh()
    setIsSaving(false)
    onOpenChange(false)
  }

  async function handleToggleActive() {
    if (!teacher) return
    setIsTogglingActive(true)
    await toggleTeacherActive(teacher.id, !teacher.is_active)
    router.refresh()
    setIsTogglingActive(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] rounded-2xl border-border bg-card p-7 shadow-2xl">
        <form key={teacher?.id ?? "new"} onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="font-serif text-2xl font-bold">
              {teacher ? `Edit ${teacher.name}` : "Add teacher"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Assign students from each student&apos;s panel; lessons land on the teacher&apos;s calendar
              automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="teacher-name" className="text-xs font-semibold">
                  Name
                </Label>
                <Input id="teacher-name" name="name" required defaultValue={teacher?.name ?? ""} className={fieldClass} />
              </div>
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="teacher-instrument" className="text-xs font-semibold">
                  Teaches
                </Label>
                <Input
                  id="teacher-instrument"
                  name="instrument"
                  placeholder="e.g. Piano, Vocal"
                  defaultValue={teacher?.instrument ?? ""}
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="flex flex-col gap-[7px]">
              <Label htmlFor="teacher-pay" className="text-xs font-semibold">
                Pay per hour (dollars)
              </Label>
              <Input
                id="teacher-pay"
                name="pay_hourly"
                type="number"
                step="0.01"
                min="0"
                placeholder="30.00"
                defaultValue={teacher ? (teacher.pay_hourly_cents / 100).toFixed(2) : "30.00"}
                className={fieldClass}
              />
              <p className="text-xs leading-[18px] text-muted-foreground">
                Pay per lesson = hourly rate × duration. At $30/hour a 30-minute lesson pays $15. Use $0 for
                yourself.
              </p>
            </div>
            <div className="flex flex-col gap-[7px]">
              <Label htmlFor="teacher-notes" className="text-xs font-semibold">
                Notes
              </Label>
              <Textarea
                id="teacher-notes"
                name="notes"
                rows={2}
                placeholder="Only you see these."
                defaultValue={teacher?.notes ?? ""}
                className="rounded-lg border-border bg-background text-sm"
              />
            </div>
            {formError && (
              <p role="alert" aria-live="polite" className="text-sm text-destructive">
                {formError}
              </p>
            )}
          </div>

          <DialogFooter className="items-center gap-2.5 border-t pt-5 sm:justify-between">
            {teacher ? (
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isTogglingActive}
                className="mr-auto text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                {isTogglingActive ? "Saving…" : teacher.is_active ? "Mark as inactive" : "Mark as active"}
              </button>
            ) : (
              <span className="mr-auto" />
            )}
            <div className="flex gap-2.5">
              <Button type="button" variant="outline" className="h-10 rounded-lg px-4" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="h-10 rounded-lg px-[18px] font-semibold">
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : teacher ? "Save changes" : "Add teacher"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
