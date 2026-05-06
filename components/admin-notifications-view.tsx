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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, Plus, Loader2, Trash2 } from "lucide-react"
import type { Notification, Student, Profile } from "@/lib/types"
import { createNotification, deleteNotification } from "@/app/admin/notifications/actions"
import { useRouter } from "next/navigation"

interface AdminNotificationsViewProps {
  notifications: Notification[]
  students: (Student & { profile: Profile })[]
}

export function AdminNotificationsView({ notifications, students }: AdminNotificationsViewProps) {
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audience, setAudience] = useState<"all" | "selected">("all")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  async function handleAddNotification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set("audience", audience)
    if (audience === "selected") {
      formData.set("recipient_ids", JSON.stringify(selectedStudents))
    }
    await createNotification(formData)
    router.refresh()
    setIsLoading(false)
    setAddDialogOpen(false)
    setSelectedStudents([])
    setAudience("all")
  }

  async function handleDelete(id: string) {
    setIsLoading(true)
    await deleteNotification(id)
    router.refresh()
    setIsLoading(false)
  }

  function toggleStudent(profileId: string) {
    setSelectedStudents((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId],
    )
  }

  return (
    <div className="space-y-8">
      {/* Actions */}
      <div className="flex justify-end">
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleAddNotification}>
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
                <DialogDescription>Send an announcement to students</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required placeholder="Notification title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea id="body" name="body" required placeholder="Your message..." rows={4} />
                </div>
                <div className="space-y-3">
                  <Label>Audience</Label>
                  <RadioGroup value={audience} onValueChange={(v) => setAudience(v as "all" | "selected")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="font-normal">
                        All students
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="selected" id="selected" />
                      <Label htmlFor="selected" className="font-normal">
                        Selected students
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                {audience === "selected" && (
                  <div className="space-y-2">
                    <Label>Select Students</Label>
                    <div className="max-h-48 space-y-2 overflow-auto rounded-lg border p-3">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={student.profile_id}
                            checked={selectedStudents.includes(student.profile_id)}
                            onCheckedChange={() => toggleStudent(student.profile_id)}
                          />
                          <Label htmlFor={student.profile_id} className="font-normal">
                            {student.profile?.full_name || "Unknown"}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || (audience === "selected" && selectedStudents.length === 0)}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Notification"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Sent Notifications
          </CardTitle>
          <CardDescription>All announcements and messages sent to students</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        <Badge variant="outline">
                          {notification.audience === "all"
                            ? "All Students"
                            : `${notification.recipient_ids?.length || 0} selected`}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{notification.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Sent: {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(notification.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">No notifications sent yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
