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
import { Loader2 } from "lucide-react"
import { createStudent, updateStudent } from "@/app/admin/students/actions"
import type { PanelStudent } from "@/components/admin/student-panel"
import { TeacherSectionsEditor } from "@/components/admin/teacher-sections-editor"
import type { Teacher } from "@/lib/types"

interface StudentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = add a new student. */
  student: PanelStudent | null
  teachers: Teacher[]
}

const fieldClass = "h-[42px] rounded-lg border-border bg-background text-sm"

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
