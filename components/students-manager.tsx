"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Users, Search, Phone, User, Loader2 } from "lucide-react"
import type { Student, Profile } from "@/lib/types"
import { updateStudentNotes, toggleStudentActive } from "@/app/admin/students/actions"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface StudentsManagerProps {
  students: (Student & { profile: Profile })[]
}

export function StudentsManager({ students }: StudentsManagerProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<(Student & { profile: Profile }) | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState("")

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase()
    return (
      student.name.toLowerCase().includes(query) ||
      student.profile?.full_name?.toLowerCase().includes(query) ||
      student.profile?.phone?.toLowerCase().includes(query)
    )
  })

  const activeStudents = filteredStudents.filter((s) => s.is_active)
  const inactiveStudents = filteredStudents.filter((s) => !s.is_active)

  function openDetails(student: Student & { profile: Profile }) {
    setSelectedStudent(student)
    setNotes(student.notes || "")
    setDetailsOpen(true)
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

  function StudentCard({ student }: { student: Student & { profile: Profile } }) {
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
          {student.profile?.full_name && <p>Parent/Guardian: {student.profile.full_name}</p>}
          {student.preferred_lesson_duration && <p>Duration: {student.preferred_lesson_duration} min</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
                <Badge variant={selectedStudent.is_active ? "default" : "secondary"}>
                  {selectedStudent.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Contact Information</h4>
                  {selectedStudent.profile?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStudent.profile.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Parent/Guardian</h4>
                  {selectedStudent.profile?.full_name && <p className="text-sm">{selectedStudent.profile.full_name}</p>}
                  {selectedStudent.profile?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStudent.profile.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-sm">
                  <p>
                    <strong>Preferred Duration:</strong> {selectedStudent.preferred_lesson_duration} minutes
                  </p>
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
