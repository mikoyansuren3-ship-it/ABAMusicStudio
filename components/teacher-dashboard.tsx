"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CalendarDays, Clock, LogOut, MailQuestion, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { sendInquiryDecision } from "@/lib/email"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type LessonLevel = "beginner" | "intermediate" | "advanced" | null
type StudentStatus = boolean

type TeacherProfile = {
  id: string
  full_name: string | null
  role: "admin" | "student" | "teacher"
}

type StudentRow = {
  id: string
  name: string
  experience_level: LessonLevel
  preferred_lesson_duration: 30 | 45 | 60
  is_active: StudentStatus
}

type BookingRow = {
  id: string
  student_id: string
  start_time: string
  end_time: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  student?: StudentRow | null
}

type BookingQueryRow = Omit<BookingRow, "student"> & {
  student?: StudentRow | StudentRow[] | null
}

type InquiryRow = {
  id: string
  name: string
  email: string
  student_age: number | null
  status: "pending" | "approved" | "denied" | "waitlist"
}

type TeacherAvailabilityRow = {
  id?: string
  teacher_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

type TimeBlock = {
  id: string
  start_time: string
  end_time: string
}

type DayAvailability = {
  enabled: boolean
  blocks: TimeBlock[]
}

const dayOptions = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
]

const timeOptions = Array.from({ length: 25 }, (_, index) => {
  const minutes = 8 * 60 + index * 30
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
})

function createEmptyAvailability(): Record<number, DayAvailability> {
  return dayOptions.reduce<Record<number, DayAvailability>>((acc, day) => {
    acc[day.value] = { enabled: false, blocks: [] }
    return acc
  }, {})
}

function createTimeBlock(startTime = "09:00", endTime = "09:30"): TimeBlock {
  return {
    id: crypto.randomUUID(),
    start_time: startTime,
    end_time: endTime,
  }
}

function formatTimeRange(startTime: string, endTime: string) {
  const start = new Date(startTime)
  const end = new Date(endTime)
  return `${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit" },
  )}`
}

function getTodayBounds() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

function getLessonDuration(booking: BookingRow) {
  return Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 60000)
}

export function TeacherDashboard() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [students, setStudents] = useState<StudentRow[]>([])
  const [inquiries, setInquiries] = useState<InquiryRow[]>([])
  const [availability, setAvailability] = useState<Record<number, DayAvailability>>(createEmptyAvailability)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingAvailability, setIsSavingAvailability] = useState(false)
  const [actionInquiryId, setActionInquiryId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setIsLoading(true)
      setError(null)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.replace("/login")
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id,full_name,role")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        setError(profileError.message)
        setIsLoading(false)
        return
      }

      if (profileData?.role !== "teacher") {
        router.replace("/portal")
        return
      }

      const today = getTodayBounds()
      const [bookingsRes, studentsRes, inquiriesRes, availabilityRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("id,student_id,start_time,end_time,status,student:students(id,name,experience_level,preferred_lesson_duration,is_active)")
          .gte("start_time", today.start)
          .lt("start_time", today.end)
          .neq("status", "cancelled")
          .order("start_time", { ascending: true }),
        supabase
          .from("students")
          .select("id,name,experience_level,preferred_lesson_duration,is_active")
          .order("name", { ascending: true }),
        supabase
          .from("inquiries")
          .select("id,name,email,student_age,status")
          .eq("status", "pending")
          .order("created_at", { ascending: true }),
        supabase
          .from("teacher_availability")
          .select("id,teacher_id,day_of_week,start_time,end_time")
          .eq("teacher_id", user.id)
          .order("day_of_week", { ascending: true })
          .order("start_time", { ascending: true }),
      ])

      const firstError = bookingsRes.error || studentsRes.error || inquiriesRes.error || availabilityRes.error
      if (firstError) {
        setError(firstError.message)
        setIsLoading(false)
        return
      }

      if (!isMounted) return

      const nextAvailability = createEmptyAvailability()
      ;((availabilityRes.data || []) as TeacherAvailabilityRow[]).forEach((row) => {
        nextAvailability[row.day_of_week].enabled = true
        nextAvailability[row.day_of_week].blocks.push(createTimeBlock(row.start_time.slice(0, 5), row.end_time.slice(0, 5)))
      })

      setProfile(profileData as TeacherProfile)
      setBookings(
        ((bookingsRes.data || []) as BookingQueryRow[]).map((booking) => ({
          ...booking,
          student: Array.isArray(booking.student) ? booking.student[0] : booking.student,
        })),
      )
      setStudents((studentsRes.data || []) as StudentRow[])
      setInquiries((inquiriesRes.data || []) as InquiryRow[])
      setAvailability(nextAvailability)
      setIsLoading(false)
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [router, supabase])

  const rosterRows = useMemo(() => {
    return students.map((student) => {
      const nextLesson = bookings
        .filter((booking) => booking.student_id === student.id && new Date(booking.start_time) >= new Date())
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]

      return { ...student, nextLesson }
    })
  }, [bookings, students])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  async function handleInquiryDecision(inquiry: InquiryRow, approved: boolean) {
    setActionInquiryId(inquiry.id)
    setError(null)

    const { error: updateError } = await supabase
      .from("inquiries")
      .update({ status: approved ? "approved" : "denied" })
      .eq("id", inquiry.id)

    if (updateError) {
      setError(updateError.message)
      setActionInquiryId(null)
      return
    }

    await sendInquiryDecision(inquiry.email, inquiry.name, approved)
    setInquiries((current) => current.filter((item) => item.id !== inquiry.id))
    setActionInquiryId(null)
    toast.success(`Inquiry ${approved ? "approved" : "denied"}`)
  }

  function toggleDay(day: number, enabled: boolean) {
    setAvailability((current) => ({
      ...current,
      [day]: {
        enabled,
        blocks: enabled && current[day].blocks.length === 0 ? [createTimeBlock()] : current[day].blocks,
      },
    }))
  }

  function updateBlock(day: number, blockId: string, field: "start_time" | "end_time", value: string) {
    setAvailability((current) => ({
      ...current,
      [day]: {
        ...current[day],
        blocks: current[day].blocks.map((block) => (block.id === blockId ? { ...block, [field]: value } : block)),
      },
    }))
  }

  function addBlock(day: number) {
    setAvailability((current) => ({
      ...current,
      [day]: {
        enabled: true,
        blocks: [...current[day].blocks, createTimeBlock()],
      },
    }))
  }

  function removeBlock(day: number, blockId: string) {
    setAvailability((current) => ({
      ...current,
      [day]: {
        ...current[day],
        blocks: current[day].blocks.filter((block) => block.id !== blockId),
      },
    }))
  }

  async function saveAvailability() {
    if (!profile) return

    setIsSavingAvailability(true)
    setError(null)

    const rows = dayOptions.flatMap((day) => {
      const dayAvailability = availability[day.value]
      if (!dayAvailability.enabled) return []

      return dayAvailability.blocks.map((block) => ({
        teacher_id: profile.id,
        day_of_week: day.value,
        start_time: block.start_time,
        end_time: block.end_time,
      }))
    })

    const invalidBlock = rows.find((row) => row.start_time >= row.end_time)
    if (invalidBlock) {
      setError("Each availability block must end after it starts.")
      setIsSavingAvailability(false)
      return
    }

    const { error: deleteError } = await supabase.from("teacher_availability").delete().eq("teacher_id", profile.id)
    if (deleteError) {
      setError(deleteError.message)
      setIsSavingAvailability(false)
      return
    }

    if (rows.length > 0) {
      const { error: upsertError } = await supabase.from("teacher_availability").upsert(rows)
      if (upsertError) {
        setError(upsertError.message)
        setIsSavingAvailability(false)
        return
      }
    }

    setIsSavingAvailability(false)
    toast.success("Availability saved")
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading teacher dashboard...</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Unable to load dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Welcome back, {profile?.full_name || "Teacher"}</h1>
          <p className="text-sm text-muted-foreground">Manage today&apos;s lessons, inquiries, and availability.</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s Lessons</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{students.filter((student) => student.is_active).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Inquiries</CardTitle>
            <MailQuestion className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inquiries.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>Lessons sorted by start time</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{booking.student?.name || "Student"}</p>
                      <p className="text-sm capitalize text-muted-foreground">
                        {booking.student?.experience_level || "Level not set"} · {getLessonDuration(booking)} minutes
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <Clock className="mr-1 inline h-4 w-4 text-muted-foreground" />
                      {formatTimeRange(booking.start_time, booking.end_time)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No lessons scheduled today.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Inquiries</CardTitle>
            <CardDescription>Approve or deny new student requests</CardDescription>
          </CardHeader>
          <CardContent>
            {inquiries.length > 0 ? (
              <div className="space-y-3">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{inquiry.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {inquiry.student_age ? `Age ${inquiry.student_age}` : "Age not provided"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionInquiryId === inquiry.id}
                          onClick={() => handleInquiryDecision(inquiry, false)}
                        >
                          Deny
                        </Button>
                        <Button
                          size="sm"
                          disabled={actionInquiryId === inquiry.id}
                          onClick={() => handleInquiryDecision(inquiry, true)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No pending inquiries.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Availability Scheduler</CardTitle>
          <CardDescription>Set recurring weekly availability in 30-minute increments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {dayOptions.map((day) => (
            <div key={day.value} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{day.label}</Label>
                <Switch checked={availability[day.value].enabled} onCheckedChange={(checked) => toggleDay(day.value, checked)} />
              </div>
              {availability[day.value].enabled && (
                <div className="mt-4 space-y-3">
                  {availability[day.value].blocks.map((block) => (
                    <div key={block.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                      <Input
                        type="time"
                        min="08:00"
                        max="20:00"
                        step={1800}
                        list="teacher-time-options"
                        value={block.start_time}
                        onChange={(event) => updateBlock(day.value, block.id, "start_time", event.target.value)}
                      />
                      <Input
                        type="time"
                        min="08:00"
                        max="20:00"
                        step={1800}
                        list="teacher-time-options"
                        value={block.end_time}
                        onChange={(event) => updateBlock(day.value, block.id, "end_time", event.target.value)}
                      />
                      <Button variant="ghost" type="button" onClick={() => removeBlock(day.value, block.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" type="button" onClick={() => addBlock(day.value)}>
                    + Add time block
                  </Button>
                </div>
              )}
            </div>
          ))}
          <datalist id="teacher-time-options">
            {timeOptions.map((time) => (
              <option key={time} value={time} />
            ))}
          </datalist>
          <Button onClick={saveAvailability} disabled={isSavingAvailability}>
            {isSavingAvailability ? "Saving..." : "Save Availability"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Roster</CardTitle>
          <CardDescription>All students with their next lesson and status.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">Level</th>
                <th className="py-3 font-medium">Next Lesson</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rosterRows.map((student) => (
                <tr key={student.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{student.name}</td>
                  <td className="py-3 capitalize">{student.experience_level || "Not set"}</td>
                  <td className="py-3">
                    {student.nextLesson
                      ? new Date(student.nextLesson.start_time).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "Not scheduled"}
                  </td>
                  <td className="py-3">
                    <Badge
                      variant="outline"
                      className={student.is_active ? "border-green-600 text-green-700" : "border-gray-400 text-gray-500"}
                    >
                      {student.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
