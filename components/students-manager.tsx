"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Users, Search, Phone, User, Loader2, Plus, Pencil } from "lucide-react"
import type { Student, Profile, StudentBilling } from "@/lib/types"
import {
  createStudent,
  updateStudent,
  updateStudentNotes,
  toggleStudentActive,
} from "@/app/admin/students/actions"
import { formatCurrency } from "@/lib/portal/format"
import { useRouter } from "next/navigation"
import Link from "next/link"

type StudentRow = Student & { profile: Profile | null; billing: StudentBilling | null }

interface StudentsManagerProps {
  students: StudentRow[]
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function StudentsManager({ students }: StudentsManagerProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSavingForm, setIsSavingForm] = useState(false)

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase()
    return (
      student.name.toLowerCase().includes(query) ||
      student.profile?.full_name?.toLowerCase().includes(query) ||
      student.profile?.phone?.toLowerCase().includes(query) ||
      student.contact_name?.toLowerCase().includes(query) ||
      student.contact_phone?.toLowerCase().includes(query)
    )
  })

  const activeStudents = filteredStudents.filter((s) => s.is_active)
  const inactiveStudents = filteredStudents.filter((s) => !s.is_active)

  function openDetails(student: StudentRow) {
    setSelectedStudent(student)
    setNotes(student.notes || "")
    setDetailsOpen(true)
  }

  function openAddForm() {
    setEditingStudent(null)
    setFormError(null)
    setFormOpen(true)
  }

  function openEditForm(student: StudentRow) {
    setEditingStudent(student)
    setFormError(null)
    setDetailsOpen(false)
    setFormOpen(true)
  }

  async function handleSaveNotes() {
    if (!selectedStudent) return
    setIsLoading(true)
    await updateStudentNotes(selectedStudent.id, notes)
    router.refresh()
    setIsLoading(false)
  }

  async function handleToggleActive() {
    if (!selectedStudent) return
    setIsLoading(true)
    await toggleStudentActive(selectedStudent.id, !selectedStudent.is_active)
    router.refresh()
    setIsLoading(false)
    setDetailsOpen(false)
  }

  async function handleSubmitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSavingForm(true)
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    const result = editingStudent ? await updateStudent(editingStudent.id, formData) : await createStudent(formData)
    if (result?.error) {
      setFormError(result.error)
      setIsSavingForm(false)
      return
    }
    router.refresh()
    setIsSavingForm(false)
    setFormOpen(false)
  }

  function guardianLabel(student: StudentRow) {
    return student.profile?.full_name || student.contact_name || null
  }

  function phoneLabel(student: StudentRow) {
    return student.profile?.phone || student.contact_phone || null
  }

  function StudentCard({ student }: { student: StudentRow }) {
    return (
      <div
        className="rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => openDetails(student)}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-muted-foreground">{student.experience_level || "Not specified"}</p>
          </div>
          <Badge variant={student.is_active ? "default" : "secondary"}>
            {student.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {guardianLabel(student) && <p>Parent/Guardian: {guardianLabel(student)}</p>}
          {student.preferred_lesson_duration && <p>Duration: {student.preferred_lesson_duration} min</p>}
          {student.billing && <p>Rate: {formatCurrency(student.billing.rate_cents)}/lesson</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search + add */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Active Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Students ({activeStudents.length})
          </CardTitle>
          <CardDescription>Currently enrolled students</CardDescription>
        </CardHeader>
        <CardContent>
          {activeStudents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              {searchQuery ? "No students match your search" : "No active students"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Students */}
      {inactiveStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Students ({inactiveStudents.length})</CardTitle>
            <CardDescription>Students no longer enrolled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Student Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form key={editingStudent?.id ?? "new"} onSubmit={handleSubmitForm}>
            <DialogHeader>
              <DialogTitle>{editingStudent ? `Edit ${editingStudent.name}` : "Add Student"}</DialogTitle>
              <DialogDescription>
                Only the name is required — everything else can be filled in later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Student name</Label>
                  <Input id="name" name="name" required defaultValue={editingStudent?.name ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_level">Experience level</Label>
                  <Select name="experience_level" defaultValue={editingStudent?.experience_level ?? "none"}>
                    <SelectTrigger>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Parent/Guardian name</Label>
                  <Input id="contact_name" name="contact_name" defaultValue={editingStudent?.contact_name ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    defaultValue={editingStudent?.contact_phone ?? ""}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">Class duration</Label>
                  <Select
                    name="duration"
                    defaultValue={String(
                      editingStudent?.billing?.duration_minutes ?? editingStudent?.preferred_lesson_duration ?? 30,
                    )}
                  >
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
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate per lesson (in dollars)</Label>
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="45.00"
                    defaultValue={
                      editingStudent?.billing ? (editingStudent.billing.rate_cents / 100).toFixed(2) : ""
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Weekly lesson day</Label>
                  <Select
                    name="day_of_week"
                    defaultValue={
                      editingStudent?.billing?.day_of_week != null
                        ? String(editingStudent.billing.day_of_week)
                        : "none"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Not set" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      {DAY_NAMES.map((day, index) => (
                        <SelectItem key={day} value={String(index)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson_time">Lesson time</Label>
                  <Input
                    id="lesson_time"
                    name="lesson_time"
                    type="time"
                    defaultValue={editingStudent?.billing?.lesson_time?.slice(0, 5) ?? ""}
                  />
                </div>
              </div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <p className="text-xs text-muted-foreground">
                Rates are per student — two students can pay different amounts for the same duration. Setting a rate,
                day, or time creates the student&apos;s billing; income shows on the Income page.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingForm}>
                {isSavingForm ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingStudent ? (
                  "Save Changes"
                ) : (
                  "Add Student"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>View and manage student information</DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <User className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.experience_level || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedStudent.is_active ? "default" : "secondary"}>
                    {selectedStudent.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => openEditForm(selectedStudent)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Info
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Parent/Guardian</h4>
                  {guardianLabel(selectedStudent) ? (
                    <p className="text-sm">{guardianLabel(selectedStudent)}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not specified</p>
                  )}
                  {phoneLabel(selectedStudent) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{phoneLabel(selectedStudent)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Lessons</h4>
                  <div className="space-y-1 text-sm">
                    <p>Duration: {selectedStudent.billing?.duration_minutes ?? selectedStudent.preferred_lesson_duration} minutes</p>
                    {selectedStudent.billing ? (
                      <>
                        <p>Rate: {formatCurrency(selectedStudent.billing.rate_cents)}/lesson</p>
                        <p>
                          Weekly slot:{" "}
                          {selectedStudent.billing.day_of_week != null && selectedStudent.billing.lesson_time
                            ? `${DAY_NAMES[selectedStudent.billing.day_of_week]}s at ${new Date(
                                `2000-01-01T${selectedStudent.billing.lesson_time}`,
                              ).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                            : "Not set"}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No billing set up yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes (only visible to admin)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this student..."
                  rows={4}
                />
                <Button variant="outline" size="sm" onClick={handleSaveNotes} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Notes"}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/admin/schedule?student=${selectedStudent.id}`}>View Schedule</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/admin/payments?student=${selectedStudent.id}`}>View Payments</Link>
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleToggleActive} disabled={isLoading}>
              {selectedStudent?.is_active ? "Mark as Inactive" : "Mark as Active"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
