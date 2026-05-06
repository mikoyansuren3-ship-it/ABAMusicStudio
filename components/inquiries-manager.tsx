"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UserPlus, Mail, Phone, Calendar, Clock, Check, X, Loader2 } from "lucide-react"
import type { Inquiry } from "@/lib/types"
import { approveInquiry, denyInquiry, updateInquiryNotes } from "@/app/admin/inquiries/actions"
import { useRouter } from "next/navigation"

interface InquiriesManagerProps {
  inquiries: Inquiry[]
}

export function InquiriesManager({ inquiries }: InquiriesManagerProps) {
  const router = useRouter()
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")

  const pendingInquiries = inquiries.filter((i) => i.status === "pending")
  const approvedInquiries = inquiries.filter((i) => i.status === "approved")
  const deniedInquiries = inquiries.filter((i) => i.status === "denied")
  const waitlistInquiries = inquiries.filter((i) => i.status === "waitlist")

  function openDetails(inquiry: Inquiry) {
    setSelectedInquiry(inquiry)
    setAdminNotes(inquiry.admin_notes || "")
    setDetailsOpen(true)
  }

  async function handleApprove() {
    if (!selectedInquiry) return
    setIsLoading(true)
    await approveInquiry(selectedInquiry.id, adminNotes)
    router.refresh()
    setIsLoading(false)
    setDetailsOpen(false)
  }

  async function handleDeny() {
    if (!selectedInquiry) return
    setIsLoading(true)
    await denyInquiry(selectedInquiry.id, adminNotes)
    router.refresh()
    setIsLoading(false)
    setDetailsOpen(false)
  }

  async function handleSaveNotes() {
    if (!selectedInquiry) return
    setIsLoading(true)
    await updateInquiryNotes(selectedInquiry.id, adminNotes)
    router.refresh()
    setIsLoading(false)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        )
      case "denied":
        return <Badge variant="destructive">Denied</Badge>
      case "waitlist":
        return <Badge variant="outline">Waitlist</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
    return (
      <div
        className="rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => openDetails(inquiry)}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{inquiry.name}</p>
            <p className="text-sm text-muted-foreground">{inquiry.email}</p>
          </div>
          {getStatusBadge(inquiry.status)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {inquiry.student_age && <span>Age: {inquiry.student_age}</span>}
          {inquiry.experience_level && <span>• {inquiry.experience_level}</span>}
          {inquiry.preferred_lesson_duration && <span>• {inquiry.preferred_lesson_duration} min</span>}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Submitted: {new Date(inquiry.created_at).toLocaleDateString()}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingInquiries.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingInquiries.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedInquiries.length})</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist ({waitlistInquiries.length})</TabsTrigger>
          <TabsTrigger value="denied">Denied ({deniedInquiries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Pending Inquiries
              </CardTitle>
              <CardDescription>New student requests awaiting your response</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInquiries.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingInquiries.map((inquiry) => (
                    <InquiryCard key={inquiry.id} inquiry={inquiry} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">No pending inquiries</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Approved Inquiries</CardTitle>
              <CardDescription>Students that have been approved</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedInquiries.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {approvedInquiries.map((inquiry) => (
                    <InquiryCard key={inquiry.id} inquiry={inquiry} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">No approved inquiries</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Waitlist</CardTitle>
              <CardDescription>Students waiting for an available spot</CardDescription>
            </CardHeader>
            <CardContent>
              {waitlistInquiries.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {waitlistInquiries.map((inquiry) => (
                    <InquiryCard key={inquiry.id} inquiry={inquiry} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">No waitlist entries</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="denied" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Denied Inquiries</CardTitle>
              <CardDescription>Requests that were not accepted</CardDescription>
            </CardHeader>
            <CardContent>
              {deniedInquiries.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {deniedInquiries.map((inquiry) => (
                    <InquiryCard key={inquiry.id} inquiry={inquiry} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">No denied inquiries</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inquiry Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>Review this student inquiry</DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedInquiry.name}</h3>
                {getStatusBadge(selectedInquiry.status)}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedInquiry.email}</span>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedInquiry.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Submitted: {new Date(selectedInquiry.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {selectedInquiry.student_age && (
                    <p>
                      <strong>Age:</strong> {selectedInquiry.student_age}
                    </p>
                  )}
                  {selectedInquiry.experience_level && (
                    <p>
                      <strong>Experience:</strong> {selectedInquiry.experience_level}
                    </p>
                  )}
                  <p>
                    <strong>Preferred Duration:</strong> {selectedInquiry.preferred_lesson_duration} minutes
                  </p>
                  {selectedInquiry.preferred_days && selectedInquiry.preferred_days.length > 0 && (
                    <p>
                      <strong>Preferred Days:</strong> {selectedInquiry.preferred_days.join(", ")}
                    </p>
                  )}
                  {selectedInquiry.preferred_times && (
                    <p>
                      <strong>Preferred Times:</strong> {selectedInquiry.preferred_times}
                    </p>
                  )}
                </div>
              </div>

              {selectedInquiry.requested_slot_start && (
                <div className="rounded-lg border bg-accent/5 p-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Requested Time Slot
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
                  <p className="text-sm font-medium mb-2">Message</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this inquiry..."
                  rows={3}
                />
                {selectedInquiry.status !== "pending" && (
                  <Button variant="outline" size="sm" onClick={handleSaveNotes} disabled={isLoading}>
                    Save Notes
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedInquiry?.status === "pending" && (
              <>
                <Button variant="outline" onClick={handleDeny} disabled={isLoading}>
                  <X className="mr-2 h-4 w-4" />
                  Deny
                </Button>
                <Button onClick={handleApprove} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Approve & Create Account
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
