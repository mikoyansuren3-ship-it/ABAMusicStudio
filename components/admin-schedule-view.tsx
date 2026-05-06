"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, Clock, Loader2, Check, X } from "lucide-react"
import type { Booking, Student, Profile, Availability, AvailabilityException } from "@/lib/types"
import { createBooking, updateBookingStatus } from "@/app/admin/schedule/actions"
import { useRouter } from "next/navigation"

interface AdminScheduleViewProps {
  bookings: (Booking & { student: Student & { profile: Profile } })[]
  students: (Student & { profile: Profile })[]
  availability: Availability[]
  exceptions: AvailabilityException[]
}

export function AdminScheduleView({ bookings, students }: AdminScheduleViewProps) {
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Group bookings by date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingBookings = bookings.filter((b) => new Date(b.start_time) >= today && b.status !== "cancelled")
  const pendingBookings = upcomingBookings.filter((b) => b.status === "pending")
  const confirmedBookings = upcomingBookings.filter((b) => b.status === "confirmed")

  // Group by day for next 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    return date
  })

  async function handleAddBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setActionError(null)
    const formData = new FormData(e.currentTarget)
    const result = await createBooking(formData)
    if (result?.error) {
      setActionError(result.error)
      setIsLoading(false)
      return
    }
    router.refresh()
    setIsLoading(false)
    setAddDialogOpen(false)
  }

  async function handleApprove(bookingId: string) {
    setIsLoading(true)
    setActionError(null)
    const result = await updateBookingStatus(bookingId, "confirmed")
    if (result?.error) setActionError(result.error)
    router.refresh()
    setIsLoading(false)
  }

  async function handleCancel(bookingId: string) {
    setIsLoading(true)
    setActionError(null)
    const result = await updateBookingStatus(bookingId, "cancelled")
    if (result?.error) setActionError(result.error)
    router.refresh()
    setIsLoading(false)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "confirmed":
        return <Badge>Confirmed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Lesson Schedule</h2>
          <p className="text-sm text-muted-foreground">Manage all student lessons</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddBooking}>
              <DialogHeader>
                <DialogTitle>Schedule New Lesson</DialogTitle>
                <DialogDescription>Create a new lesson for a student</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="student_id">Student</Label>
                  <Select name="student_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                          {student.profile?.full_name ? ` (${student.profile.full_name})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required min={today.toISOString().split("T")[0]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input id="start_time" name="start_time" type="time" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select name="duration" defaultValue="30">
                      <SelectTrigger>
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
              </div>
              {actionError && <p className="text-sm text-destructive">{actionError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Lesson"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Approvals */}
      {pendingBookings.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Approval ({pendingBookings.length})
            </CardTitle>
            <CardDescription>Reschedule requests awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      <span className="text-xs font-medium">
                        {new Date(booking.start_time).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-lg font-bold">{new Date(booking.start_time).getDate()}</span>
                    </div>
                    <div>
                      <p className="font-medium">{booking.student?.name || "Student"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.start_time).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(booking.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleCancel(booking.id)} disabled={isLoading}>
                      <X className="mr-1 h-4 w-4" />
                      Deny
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(booking.id)} disabled={isLoading}>
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {actionError && !addDialogOpen && <p className="text-sm text-destructive">{actionError}</p>}

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {days.map((day) => {
              const dayBookings = confirmedBookings.filter((b) => {
                const bookingDate = new Date(b.start_time)
                return bookingDate.toDateString() === day.toDateString()
              })

              return (
                <div key={day.toISOString()}>
                  <h3 className="mb-3 font-medium">
                    {day.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    {day.toDateString() === today.toDateString() && (
                      <Badge variant="outline" className="ml-2">
                        Today
                      </Badge>
                    )}
                  </h3>
                  {dayBookings.length > 0 ? (
                    <div className="space-y-2">
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                              <Clock className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium">{booking.student?.name || "Student"}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.start_time).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {new Date(booking.end_time).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No lessons scheduled</p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
