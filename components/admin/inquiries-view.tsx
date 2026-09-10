"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Calendar, Check, Clock, Loader2, Mail, Phone, X } from "lucide-react"
import type { Inquiry } from "@/lib/types"
import { approveInquiry, denyInquiry, waitlistInquiry, updateInquiryNotes } from "@/app/admin/inquiries/actions"
import { AdminCard, EmptyState } from "@/components/admin/ui"
import { formatMediumDate } from "@/lib/portal/format"
import { experienceLabel } from "@/lib/portal/format"

export type InquiryTab = "waiting" | "approved" | "waitlist" | "declined"

const EMPTY_COPY: Record<InquiryTab, { title: string; body: string }> = {
  waiting: {
    title: "Inbox clear",
    body: "When a family fills in the inquiry form, their request appears here with the age, level and preferred times they asked for — approve and they become a student.",
  },
  approved: {
    title: "None approved yet",
    body: "Approve a request and it lands here. The family finishes by creating their portal account from the link you send them.",
  },
  waitlist: {
    title: "No one waiting",
    body: "Park a request here when the schedule is full — it keeps the family's details handy for the moment a slot opens.",
  },
  declined: {
    title: "No declined requests",
    body: "Requests you decline are kept here for reference rather than deleted.",
  },
}

interface InquiriesListProps {
  inquiries: Inquiry[]
  tab: InquiryTab
  declinedCount: number
}

export function InquiriesList({ inquiries, tab, declinedCount }: InquiriesListProps) {
  const router = useRouter()
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pendingRowId, setPendingRowId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function openDetails(inquiry: Inquiry) {
    setSelectedInquiry(inquiry)
    setAdminNotes(inquiry.admin_notes || "")
  }

  async function decide(
    inquiry: Inquiry,
    action: "approve" | "waitlist" | "decline",
    notes: string,
    fromDialog: boolean,
  ) {
    if (fromDialog) setIsLoading(true)
    else setPendingRowId(inquiry.id)
    setActionError(null)
    const run = action === "approve" ? approveInquiry : action === "waitlist" ? waitlistInquiry : denyInquiry
    const result = await run(inquiry.id, notes)
    if (result?.error) setActionError(result.error)
    router.refresh()
    setIsLoading(false)
    setPendingRowId(null)
    if (fromDialog && !result?.error) setSelectedInquiry(null)
  }

  async function handleSaveNotes() {
    if (!selectedInquiry) return
    setIsLoading(true)
    await updateInquiryNotes(selectedInquiry.id, adminNotes)
    router.refresh()
    setIsLoading(false)
  }

  function metaLine(inquiry: Inquiry) {
    const parts: string[] = []
    if (inquiry.instrument) parts.push(inquiry.instrument)
    if (inquiry.student_age) parts.push(`Age ${inquiry.student_age}`)
    if (inquiry.experience_level) parts.push(experienceLabel(inquiry.experience_level))
    if (inquiry.preferred_lesson_duration) parts.push(`${inquiry.preferred_lesson_duration} min`)
    if (inquiry.preferred_days && inquiry.preferred_days.length > 0) parts.push(inquiry.preferred_days.join(", "))
    if (inquiry.preferred_times) parts.push(inquiry.preferred_times)
    return parts.join(" · ")
  }

  return (
    <>
      <AdminCard className="flex flex-col p-0">
        {inquiries.length === 0 ? (
          <EmptyState
            title={EMPTY_COPY[tab].title}
            cta={
              tab === "waiting" && declinedCount > 0 ? (
                <Link
                  href="/admin/inquiries?status=declined"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent transition-colors hover:text-accent-strong"
                >
                  See the {declinedCount === 1 ? "one declined request" : `${declinedCount} declined requests`}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              ) : undefined
            }
            className="py-16"
          >
            {EMPTY_COPY[tab].body}
          </EmptyState>
        ) : (
          <div className="flex flex-col px-6 py-2">
            {actionError && (
              <p role="alert" aria-live="polite" className="pt-3 text-sm text-destructive">
                {actionError}
              </p>
            )}
            {inquiries.map((inquiry, index) => (
              <div
                key={inquiry.id}
                className={`flex flex-wrap items-center gap-4 py-[18px] ${index < inquiries.length - 1 ? "border-b" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => openDetails(inquiry)}
                  className="flex min-w-0 flex-1 flex-col items-start gap-[3px] text-left"
                >
                  <span className="font-serif text-[19px] font-semibold">{inquiry.name}</span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {metaLine(inquiry) || inquiry.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Submitted {formatMediumDate(inquiry.created_at)}
                  </span>
                </button>
                {(tab === "waiting" || tab === "waitlist") && (
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {pendingRowId === inquiry.id ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Saving" />
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="h-9 rounded-lg font-semibold"
                          onClick={() => decide(inquiry, "approve", inquiry.admin_notes || "", false)}
                        >
                          Approve
                        </Button>
                        {tab === "waiting" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-lg"
                            onClick={() => decide(inquiry, "waitlist", inquiry.admin_notes || "", false)}
                          >
                            Waitlist
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-lg"
                          onClick={() => decide(inquiry, "decline", inquiry.admin_notes || "", false)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Details dialog */}
      <Dialog open={selectedInquiry !== null} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl border-border bg-card p-7 shadow-2xl">
          {selectedInquiry && (
            <div className="flex flex-col gap-5">
              <DialogHeader className="gap-1.5 text-left">
                <DialogTitle className="font-serif text-2xl font-bold">{selectedInquiry.name}</DialogTitle>
                <DialogDescription className="text-[13px] text-muted-foreground">
                  Inquiry from the website form
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2.5 text-sm">
                  <span className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" aria-hidden />
                    {selectedInquiry.email}
                  </span>
                  {selectedInquiry.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" aria-hidden />
                      {selectedInquiry.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" aria-hidden />
                    Submitted {formatMediumDate(selectedInquiry.created_at)}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 text-sm">
                  {selectedInquiry.instrument && (
                    <p>
                      <span className="font-semibold">Instrument:</span> {selectedInquiry.instrument}
                    </p>
                  )}
                  {selectedInquiry.student_age && (
                    <p>
                      <span className="font-semibold">Age:</span> {selectedInquiry.student_age}
                    </p>
                  )}
                  {selectedInquiry.experience_level && (
                    <p>
                      <span className="font-semibold">Experience:</span>{" "}
                      {experienceLabel(selectedInquiry.experience_level)}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">Duration:</span> {selectedInquiry.preferred_lesson_duration}{" "}
                    minutes
                  </p>
                  {selectedInquiry.preferred_days && selectedInquiry.preferred_days.length > 0 && (
                    <p>
                      <span className="font-semibold">Preferred days:</span>{" "}
                      {selectedInquiry.preferred_days.join(", ")}
                    </p>
                  )}
                  {selectedInquiry.preferred_times && (
                    <p>
                      <span className="font-semibold">Preferred times:</span> {selectedInquiry.preferred_times}
                    </p>
                  )}
                </div>
              </div>

              {selectedInquiry.requested_slot_start && (
                <div className="rounded-lg border bg-accent/5 px-3.5 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="size-4" aria-hidden />
                    Requested time slot
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedInquiry.requested_slot_start).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(selectedInquiry.requested_slot_start).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {selectedInquiry.message && (
                <div>
                  <p className="mb-1.5 text-sm font-semibold">Message</p>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedInquiry.message}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="admin_notes" className="text-xs font-semibold">
                  Internal notes
                </Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Only you see these."
                  rows={3}
                  className="rounded-lg border-border bg-background"
                />
                {selectedInquiry.status !== "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit rounded-lg"
                    onClick={handleSaveNotes}
                    disabled={isLoading}
                  >
                    Save notes
                  </Button>
                )}
              </div>

              {actionError && (
                <p role="alert" aria-live="polite" className="text-sm text-destructive">
                  {actionError}
                </p>
              )}

              {(selectedInquiry.status === "pending" || selectedInquiry.status === "waitlist") && (
                <DialogFooter className="gap-2.5 border-t pt-5">
                  <Button
                    variant="outline"
                    className="h-10 rounded-lg px-4"
                    onClick={() => decide(selectedInquiry, "decline", adminNotes, true)}
                    disabled={isLoading}
                  >
                    <X className="mr-1.5 size-4" aria-hidden />
                    Decline
                  </Button>
                  {selectedInquiry.status === "pending" && (
                    <Button
                      variant="outline"
                      className="h-10 rounded-lg px-4"
                      onClick={() => decide(selectedInquiry, "waitlist", adminNotes, true)}
                      disabled={isLoading}
                    >
                      Waitlist
                    </Button>
                  )}
                  <Button
                    className="h-10 rounded-lg px-[18px] font-semibold"
                    onClick={() => decide(selectedInquiry, "approve", adminNotes, true)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                    ) : (
                      <Check className="mr-1.5 size-4" aria-hidden />
                    )}
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
