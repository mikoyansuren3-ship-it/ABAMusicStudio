"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Bell, Loader2, Plus, Trash2 } from "lucide-react"
import type { Notification, Profile, Student } from "@/lib/types"
import { createAnnouncement, deleteAnnouncement } from "@/app/admin/announcements/actions"
import { AdminCard, DashedButton, EmptyState, Eyebrow, PageHeader } from "@/components/admin/ui"
import { formatDateTime } from "@/lib/portal/format"

interface AnnouncementsViewProps {
  announcements: Notification[]
  students: (Student & { profile: Profile | null })[]
}

export function AnnouncementsView({ announcements, students }: AnnouncementsViewProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [audience, setAudience] = useState<"all" | "selected">("all")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])

  // Announcements go to parent portal accounts; manually added students have none.
  const notifiableStudents = students.filter(
    (student): student is Student & { profile: Profile | null; parent_id: string } => student.parent_id !== null,
  )
  const skippedStudents = students.filter((student) => student.parent_id === null)

  function resetDialog() {
    setAudience("all")
    setSelectedRecipients([])
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.set("audience", audience)
    if (audience === "selected") {
      formData.set("recipient_ids", JSON.stringify(selectedRecipients))
    }
    await createAnnouncement(formData)
    router.refresh()
    setIsSaving(false)
    setDialogOpen(false)
    resetDialog()
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this announcement? Families will no longer see it in their portal.")) return
    setIsDeletingId(id)
    await deleteAnnouncement(id)
    router.refresh()
    setIsDeletingId(null)
  }

  function toggleRecipient(profileId: string) {
    setSelectedRecipients((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId],
    )
  }

  const summary = `Messages that appear in every family's portal · ${
    announcements.length === 0
      ? "nothing sent yet"
      : `${announcements.length} sent so far`
  }`

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Announcements"
        summary={summary}
        actions={
          <Button className="h-10 gap-2 rounded-lg px-[18px] text-sm font-semibold" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Write announcement
          </Button>
        }
      />

      {announcements.length === 0 ? (
        <AdminCard className="p-0">
          <EmptyState
            title="Nothing sent yet"
            cta={
              <DashedButton onClick={() => setDialogOpen(true)}>
                <Bell className="size-3.5" aria-hidden />
                Write the first one
              </DashedButton>
            }
            className="py-16"
          >
            Recital dates, a week off, a change of hours — send it to everyone or pick a few families, and it shows up
            the next time they open the portal.
          </EmptyState>
        </AdminCard>
      ) : (
        <AdminCard className="flex flex-col pb-6">
          <Eyebrow className="mb-1.5">Sent</Eyebrow>
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className={`flex items-start gap-4 py-4 ${index < announcements.length - 1 ? "border-b" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-semibold">{announcement.title}</p>
                  <span className="inline-flex items-center rounded-md border px-2 py-[2px] text-[11px] font-medium text-muted-foreground">
                    {announcement.audience === "all"
                      ? "Everyone"
                      : `${announcement.recipient_ids?.length || 0} selected`}
                  </span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-5 text-muted-foreground">
                  {announcement.body}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">Sent {formatDateTime(announcement.created_at)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label={`Delete announcement "${announcement.title}"`}
                onClick={() => handleDelete(announcement.id)}
                disabled={isDeletingId === announcement.id}
              >
                {isDeletingId === announcement.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" aria-hidden />
                )}
              </Button>
            </div>
          ))}
        </AdminCard>
      )}

      <AdminCard className="flex flex-col gap-1.5">
        <Eyebrow>Who can receive one</Eyebrow>
        <p className="max-w-[620px] text-[13px] leading-[21px] text-pretty text-muted-foreground">
          {skippedStudents.length === 0
            ? "Announcements go to parent portal accounts, and every family has one — everyone you teach can receive them."
            : `Announcements go to parent portal accounts. ${skippedStudents
                .map((student) => student.name)
                .join(", ")} ${skippedStudents.length === 1 ? "was" : "were"} added by hand and ${
                skippedStudents.length === 1 ? "has" : "have"
              } no account yet, so ${skippedStudents.length === 1 ? "that family" : "those families"} would be skipped — invite them to sign up to include them.`}
        </p>
      </AdminCard>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetDialog()
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border-border bg-card p-7 shadow-2xl">
          <form onSubmit={handleCreate} className="flex flex-col gap-[22px]">
            <DialogHeader className="gap-1.5 text-left">
              <DialogTitle className="font-serif text-2xl font-bold">New announcement</DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                It appears in each family&apos;s portal the next time they open it.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="announcement-title" className="text-xs font-semibold">
                  Title
                </Label>
                <Input
                  id="announcement-title"
                  name="title"
                  required
                  placeholder="e.g. Winter recital date"
                  className="h-[42px] rounded-lg border-border bg-background text-sm"
                />
              </div>
              <div className="flex flex-col gap-[7px]">
                <Label htmlFor="announcement-body" className="text-xs font-semibold">
                  Message
                </Label>
                <Textarea
                  id="announcement-body"
                  name="body"
                  required
                  placeholder="Your message…"
                  rows={4}
                  className="rounded-lg border-border bg-background text-sm"
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <Label className="text-xs font-semibold">Audience</Label>
                <RadioGroup value={audience} onValueChange={(value) => setAudience(value as "all" | "selected")}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="all" id="audience-all" />
                    <Label htmlFor="audience-all" className="font-normal">
                      All families
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="selected" id="audience-selected" />
                    <Label htmlFor="audience-selected" className="font-normal">
                      Selected families
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {audience === "selected" && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold">Choose families</Label>
                  <div className="flex max-h-48 flex-col gap-2 overflow-auto rounded-lg border bg-background p-3">
                    {notifiableStudents.length === 0 ? (
                      <p className="text-[13px] text-muted-foreground">
                        No families have portal accounts yet — announcements can only reach signed-up families.
                      </p>
                    ) : (
                      notifiableStudents.map((student) => (
                        <div key={student.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`recipient-${student.id}`}
                            checked={selectedRecipients.includes(student.parent_id)}
                            onCheckedChange={() => toggleRecipient(student.parent_id)}
                          />
                          <Label htmlFor={`recipient-${student.id}`} className="font-normal">
                            {student.name}
                            {student.profile?.full_name ? ` (${student.profile.full_name})` : ""}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2.5 border-t pt-5">
              <Button type="button" variant="outline" className="h-10 rounded-lg px-4" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || (audience === "selected" && selectedRecipients.length === 0)}
                className="h-10 rounded-lg px-[18px] font-semibold"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Send announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
