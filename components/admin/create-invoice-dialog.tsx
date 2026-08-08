"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"
import { createInvoice } from "@/app/admin/money/actions"
import { DashedButton } from "@/components/admin/ui"

export interface InvoiceStudentOption {
  id: string
  name: string
  guardian: string | null
  /** Admin-entered guardian email, if any. */
  email: string | null
  /** Family has a parent portal account (its login email is resolved server-side). */
  hasPortalAccount: boolean
}

interface CreateInvoiceButtonProps {
  students: InvoiceStudentOption[]
  variant?: "primary" | "dashed"
  label?: string
}

const fieldClass = "h-[42px] rounded-lg border-border bg-background text-sm"

export function CreateInvoiceButton({ students, variant = "primary", label = "Create invoice" }: CreateInvoiceButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [sendEmail, setSendEmail] = useState(true)
  /** Set when the invoice saved but the email failed — the form is done at that point. */
  const [emailWarning, setEmailWarning] = useState<string | null>(null)

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null
  const canEmail = selectedStudent ? Boolean(selectedStudent.email || selectedStudent.hasPortalAccount) : true
  const willSend = sendEmail && canEmail

  const emailHint = !selectedStudent
    ? "Sent as soon as the invoice is created."
    : selectedStudent.email
      ? `Goes to ${selectedStudent.email}.`
      : selectedStudent.hasPortalAccount
        ? "Goes to the family's portal account email."
        : "No email on file — add a guardian email in the student's details first."

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setFormError(null)
      setEmailWarning(null)
      setSelectedStudentId(null)
      setSendEmail(true)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("send_email", willSend ? "1" : "")
    const result = await createInvoice(formData)
    if (result?.error) {
      setFormError(result.error)
      setIsSaving(false)
      return
    }
    router.refresh()
    setIsSaving(false)
    if (result && "emailWarning" in result && result.emailWarning) {
      // Invoice exists now — swap to a notice so a resubmit can't duplicate it.
      setEmailWarning(result.emailWarning)
      return
    }
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {variant === "dashed" ? (
          <DashedButton>
            <Plus className="size-3.5" aria-hidden />
            {label}
          </DashedButton>
        ) : (
          <Button className="h-10 gap-2 rounded-lg px-[18px] text-sm font-semibold">
            <Plus className="size-4" aria-hidden />
            {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[460px] rounded-2xl border-border bg-card p-7 shadow-2xl">
        {emailWarning ? (
          <div className="flex flex-col gap-5">
            <DialogHeader className="gap-1.5 text-left">
              <DialogTitle className="font-serif text-2xl font-bold">Invoice created</DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                The invoice was saved, but the email didn&apos;t go out.
              </DialogDescription>
            </DialogHeader>
            <p role="alert" aria-live="polite" className="rounded-lg border border-accent/50 bg-accent/5 px-3.5 py-3 text-[13px] leading-5 text-accent-strong">
              {emailWarning}
            </p>
            <p className="text-[13px] leading-5 text-muted-foreground">
              You can send it later with the invoice&apos;s Email button.
            </p>
            <DialogFooter className="border-t pt-5">
              <Button className="h-10 rounded-lg px-[18px] font-semibold" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
            <DialogHeader className="gap-1.5 text-left">
              <DialogTitle className="font-serif text-2xl font-bold">New invoice</DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                Families with a portal account can pay it online; cash and check get marked by hand.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="invoice-student" className="text-xs font-semibold">
                  Student
                </Label>
                <Select name="student_id" required onValueChange={setSelectedStudentId}>
                  <SelectTrigger id="invoice-student" className={`${fieldClass} w-full`}>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                        {student.guardian ? ` (${student.guardian})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="invoice-amount" className="text-xs font-semibold">
                  Amount (dollars)
                </Label>
                <Input
                  id="invoice-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="45.00"
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="invoice-description" className="text-xs font-semibold">
                  Description
                </Label>
                <Textarea
                  id="invoice-description"
                  name="description"
                  placeholder="e.g. August lessons"
                  rows={2}
                  className="rounded-lg border-border bg-background text-sm"
                />
              </div>
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="invoice-due" className="text-xs font-semibold">
                  Due date
                </Label>
                <Input id="invoice-due" name="due_date" type="date" className={fieldClass} />
              </div>

              <div className="flex flex-col gap-1.5 rounded-lg border bg-background px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="invoice-send-email"
                    checked={willSend}
                    disabled={!canEmail}
                    onCheckedChange={(checked) => setSendEmail(checked === true)}
                  />
                  <Label htmlFor="invoice-send-email" className="font-normal">
                    Email the invoice to the family
                  </Label>
                </div>
                <p className={`pl-7 text-xs leading-[18px] ${canEmail ? "text-muted-foreground" : "text-accent-strong"}`}>
                  {emailHint}
                </p>
              </div>

              {formError && (
                <p role="alert" aria-live="polite" className="text-sm text-destructive">
                  {formError}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2.5 border-t pt-5">
              <Button type="button" variant="outline" className="h-10 rounded-lg px-4" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="h-10 rounded-lg px-[18px] font-semibold">
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : willSend ? (
                  "Create and email"
                ) : (
                  "Create invoice"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
