"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { Clock, Plus, Trash2, Loader2, CalendarOff } from "lucide-react"
import type { Availability, AvailabilityException } from "@/lib/types"
import {
  updateAvailability,
  addAvailability,
  deleteAvailability,
  addException,
  deleteException,
} from "@/app/admin/availability/actions"
import { useRouter } from "next/navigation"

interface AvailabilityManagerProps {
  availability: Availability[]
  exceptions: AvailabilityException[]
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function AvailabilityManager({ availability, exceptions }: AvailabilityManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false)

  async function handleToggle(id: string, isActive: boolean) {
    setIsLoading(true)
    await updateAvailability(id, { is_active: isActive })
    router.refresh()
    setIsLoading(false)
  }

  async function handleUpdateTime(id: string, field: "start_time" | "end_time", value: string) {
    await updateAvailability(id, { [field]: value })
    router.refresh()
  }

  async function handleAddAvailability(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    await addAvailability(formData)
    router.refresh()
    setIsLoading(false)
    setAddDialogOpen(false)
  }

  async function handleDelete(id: string) {
    setIsLoading(true)
    await deleteAvailability(id)
    router.refresh()
    setIsLoading(false)
  }

  async function handleAddException(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    await addException(formData)
    router.refresh()
    setIsLoading(false)
    setExceptionDialogOpen(false)
  }

  async function handleDeleteException(id: string) {
    setIsLoading(true)
    await deleteException(id)
    router.refresh()
    setIsLoading(false)
  }

  // Group availability by day
  const groupedAvailability = dayNames.map((name, index) => ({
    day: name,
    dayIndex: index,
    slots: availability.filter((a) => a.day_of_week === index),
  }))

  return (
    <div className="space-y-8">
      {/* Weekly Availability */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Weekly Availability
              </CardTitle>
              <CardDescription>Set your recurring weekly schedule</CardDescription>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Time Block
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddAvailability}>
                  <DialogHeader>
                    <DialogTitle>Add Availability</DialogTitle>
                    <DialogDescription>Add a new recurring time block to your schedule.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="day_of_week">Day</Label>
                      <Select name="day_of_week" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {dayNames.map((day, index) => (
                            <SelectItem key={day} value={index.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input id="start_time" name="start_time" type="time" required defaultValue="15:00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Input id="end_time" name="end_time" type="time" required defaultValue="19:00" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupedAvailability.map(({ day, slots }) => (
              <div key={day} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{day}</h3>
                </div>
                {slots.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {slots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-4 rounded bg-muted/50 p-2">
                        <Switch
                          checked={slot.is_active}
                          onCheckedChange={(checked) => handleToggle(slot.id, checked)}
                        />
                        <Input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => handleUpdateTime(slot.id, "start_time", e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => handleUpdateTime(slot.id, "end_time", e.target.value)}
                          className="w-32"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(slot.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No availability set</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exceptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarOff className="h-5 w-5" />
                Schedule Exceptions
              </CardTitle>
              <CardDescription>Block off days for vacations, holidays, or special events</CardDescription>
            </div>
            <Dialog open={exceptionDialogOpen} onOpenChange={setExceptionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exception
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddException}>
                  <DialogHeader>
                    <DialogTitle>Add Exception</DialogTitle>
                    <DialogDescription>Block off a specific date or add special hours.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="exception_date">Date</Label>
                      <Input
                        id="exception_date"
                        name="exception_date"
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason (optional)</Label>
                      <Input id="reason" name="reason" placeholder="e.g., Holiday, Vacation" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="is_available" name="is_available" />
                      <Label htmlFor="is_available">Available with special hours</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setExceptionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {exceptions.length > 0 ? (
            <div className="space-y-2">
              {exceptions.map((exception) => (
                <div key={exception.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">
                      {new Date(exception.exception_date + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exception.is_available
                        ? `Special hours: ${exception.start_time} - ${exception.end_time}`
                        : "Unavailable"}
                      {exception.reason && ` • ${exception.reason}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteException(exception.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No exceptions scheduled</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
