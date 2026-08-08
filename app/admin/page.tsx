import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AdminCard, Eyebrow, PageHeader } from "@/components/admin/ui"
import { AddLessonButton } from "@/components/admin/add-lesson-dialog"
import {
  formatCurrencyCompact,
  formatMinutes,
  formatTimeRange,
  greetingForHour,
  numberWord,
  timeToMinutes,
  toDateKey,
} from "@/lib/admin/format"
import { formatTime } from "@/lib/portal/format"
import type { Availability, AvailabilityException, Booking, Profile, Student, StudentBilling, StudentSlot } from "@/lib/types"

const HOUR_ROW_PX = 66

type BookingRow = Booking & { student: (Student & { profile: Profile | null }) | null }
type StudentRow = Student & { profile: Profile | null; billing: StudentBilling | null; slots: StudentSlot[] }

function minutesToTimeString(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`
}

export default async function AdminTodayPage() {
  const supabase = await createClient()

  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const todayKey = toDateKey(today)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [
    profileRes,
    todaysBookingsRes,
    pendingInquiriesRes,
    unpaidInvoicesRes,
    pendingBookingsRes,
    studentsRes,
    availabilityRes,
    todayExceptionRes,
    announcementCountRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user?.id ?? "").single(),
    supabase
      .from("bookings")
      .select("*, student:students(*, profile:profiles(*))")
      .gte("start_time", today.toISOString())
      .lt("start_time", tomorrow.toISOString())
      .in("status", ["confirmed", "pending"])
      .order("start_time"),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("invoices").select("*").eq("status", "unpaid"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .gte("start_time", today.toISOString()),
    supabase
      .from("students")
      .select("*, profile:profiles(*), billing:student_billing(*), slots:student_slots(*)")
      .eq("is_active", true),
    supabase.from("availability").select("*").eq("is_active", true),
    supabase.from("availability_exceptions").select("*").eq("exception_date", todayKey).maybeSingle(),
    supabase.from("notifications").select("id", { count: "exact", head: true }),
  ])

  const profile = profileRes.data as Profile | null
  const todaysBookings = (todaysBookingsRes.data || []) as BookingRow[]
  const confirmedToday = todaysBookings.filter((booking) => booking.status === "confirmed")
  const pendingInquiryCount = pendingInquiriesRes.count || 0
  const unpaidInvoices = unpaidInvoicesRes.data || []
  const rescheduleCount = pendingBookingsRes.count || 0
  const students = (
    (studentsRes.data || []) as (Student & {
      profile: Profile | null
      billing: StudentBilling[] | StudentBilling | null
      slots: StudentSlot[] | null
    })[]
  ).map(
    (student): StudentRow => ({
      ...student,
      billing: Array.isArray(student.billing) ? (student.billing[0] ?? null) : (student.billing ?? null),
      slots: student.slots || [],
    }),
  )
  const availability = (availabilityRes.data || []) as Availability[]
  const todayException = todayExceptionRes.data as AvailabilityException | null
  const announcementCount = announcementCountRes.count || 0

  const totalUnpaid = unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const overdueInvoices = unpaidInvoices.filter(
    (invoice) => invoice.due_date && new Date(`${invoice.due_date}T23:59:59`) < now,
  )

  // Today's open window: a closure wins, then the weekday's availability slots.
  const todaySlots = availability.filter((slot) => slot.day_of_week === today.getDay())
  let openStart: number | null = null
  let openEnd: number | null = null
  if (todayException) {
    if (todayException.is_available && todayException.start_time && todayException.end_time) {
      openStart = timeToMinutes(todayException.start_time)
      openEnd = timeToMinutes(todayException.end_time)
    }
  } else if (todaySlots.length > 0) {
    openStart = Math.min(...todaySlots.map((slot) => timeToMinutes(slot.start_time)))
    openEnd = Math.max(...todaySlots.map((slot) => timeToMinutes(slot.end_time)))
  }
  const isOpenToday = openStart !== null && openEnd !== null && openEnd > openStart

  // Timeline window: the open block, stretched to cover any lesson booked outside it.
  let windowStart = isOpenToday ? openStart! : 15 * 60
  let windowEnd = isOpenToday ? openEnd! : 19 * 60
  for (const booking of confirmedToday) {
    const start = new Date(booking.start_time)
    const end = new Date(booking.end_time)
    windowStart = Math.min(windowStart, Math.floor((start.getHours() * 60 + start.getMinutes()) / 60) * 60)
    windowEnd = Math.max(windowEnd, Math.ceil((end.getHours() * 60 + end.getMinutes()) / 60) * 60)
  }
  const gridStart = Math.floor(windowStart / 60) * 60
  const gridEnd = Math.ceil(windowEnd / 60) * 60
  const gridHours: number[] = []
  for (let minute = gridStart; minute < gridEnd; minute += 60) gridHours.push(minute)
  const bandHeight = gridHours.length * HOUR_ROW_PX
  const showTimeline = isOpenToday || confirmedToday.length > 0

  const openHoursCount = isOpenToday ? (openEnd! - openStart!) / 60 : 0
  const openRangeLabel = isOpenToday
    ? formatTimeRange(minutesToTimeString(openStart!), minutesToTimeString(openEnd!))
    : null

  const greeting = `${greetingForHour(now.getHours())}, ${(profile?.full_name || "there").split(" ")[0]}`
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const summary = `${dateLabel} · ${
    !isOpenToday
      ? confirmedToday.length > 0
        ? `studio closed, ${confirmedToday.length} ${confirmedToday.length === 1 ? "lesson" : "lessons"} booked anyway`
        : "studio closed today"
      : confirmedToday.length === 0
        ? `${numberWord(openHoursCount)} ${openHoursCount === 1 ? "hour" : "hours"} open, nothing booked yet`
        : `${confirmedToday.length} ${confirmedToday.length === 1 ? "lesson" : "lessons"} on the books`
  }`

  const studentOptions = students.map((student) => ({
    id: student.id,
    name: student.name,
    guardian: student.profile?.full_name || student.contact_name || null,
  }))

  // "Needs you": inquiries, reschedule requests, overdue invoices.
  const needsYou: { key: string; label: string; href: string }[] = []
  if (pendingInquiryCount > 0) {
    needsYou.push({
      key: "inquiries",
      label: `${pendingInquiryCount} ${pendingInquiryCount === 1 ? "inquiry" : "inquiries"} waiting for a reply`,
      href: "/admin/inquiries",
    })
  }
  if (rescheduleCount > 0) {
    needsYou.push({
      key: "reschedules",
      label: `${rescheduleCount} reschedule ${rescheduleCount === 1 ? "request" : "requests"} to approve`,
      href: "/admin/schedule",
    })
  }
  if (overdueInvoices.length > 0) {
    const overdueTotal = overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    needsYou.push({
      key: "overdue",
      label: `${overdueInvoices.length} overdue ${overdueInvoices.length === 1 ? "invoice" : "invoices"} · ${formatCurrencyCompact(overdueTotal)}`,
      href: "/admin/money?tab=invoices",
    })
  }

  // "Finish setting up": one-time studio setup work.
  const setupTasks: { key: string; label: string; href: string }[] = []
  if (availability.length === 0) {
    setupTasks.push({ key: "availability", label: "Set your weekly availability", href: "/admin/availability" })
  }
  if (students.length === 0) {
    setupTasks.push({ key: "students", label: "Add your first student", href: "/admin/students" })
  }
  for (const student of students) {
    const hasRate = student.billing && student.billing.rate_cents > 0
    const hasSlot = student.slots.length > 0
    if (!hasRate || !hasSlot) {
      setupTasks.push({
        key: `billing-${student.id}`,
        label: `Set ${student.name}'s rate and weekly slot`,
        href: "/admin/money?tab=income",
      })
    }
  }
  if (announcementCount === 0) {
    setupTasks.push({ key: "announcement", label: "Send your first announcement", href: "/admin/announcements" })
  }

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <PageHeader
        title={greeting}
        summary={summary}
        actions={<AddLessonButton students={studentOptions} availability={availability} />}
      />

      <div className="flex flex-col items-stretch gap-6 lg:flex-row">
        <AdminCard className="flex min-w-0 flex-1 flex-col gap-[18px] pb-[26px]">
          <div className="flex items-center justify-between gap-4">
            <Eyebrow>Today&apos;s lessons</Eyebrow>
            <span className="text-xs text-muted-foreground">
              {isOpenToday ? `Open ${openRangeLabel}` : "Closed today"}
            </span>
          </div>

          {showTimeline ? (
            <div className="relative">
              <div className="flex flex-col">
                {gridHours.map((minute) => (
                  <div key={minute} className="flex h-[66px] border-t">
                    <span className="w-16 shrink-0 pt-1.5 text-[11px] font-medium text-muted-foreground">
                      {formatMinutes(minute).replace(":00", "")}
                    </span>
                  </div>
                ))}
                <div className="flex h-0 border-t">
                  <span className="w-16 shrink-0 pt-1.5 text-[11px] font-medium text-muted-foreground">
                    {formatMinutes(gridEnd).replace(":00", "")}
                  </span>
                </div>
              </div>

              <div
                className={`absolute left-16 right-0 top-0 flex flex-col rounded-r-lg ${
                  isOpenToday ? "border-l-2 border-accent bg-accent/7" : "bg-muted/60"
                }`}
                style={{ height: `${bandHeight}px` }}
              >
                {confirmedToday.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3.5 px-6 text-center">
                    <p className="font-serif text-xl font-semibold">
                      {`${numberWord(openHoursCount).replace(/^./, (c) => c.toUpperCase())} ${openHoursCount === 1 ? "hour" : "hours"} open`}
                    </p>
                    <span className="text-[13px] text-muted-foreground">
                      Nothing scheduled — drop a lesson anywhere in this block
                    </span>
                    <AddLessonButton
                      students={studentOptions}
                      availability={availability}
                      variant="dashed"
                      label="Book a lesson"
                    />
                  </div>
                ) : (
                  confirmedToday.map((booking) => {
                    const start = new Date(booking.start_time)
                    const end = new Date(booking.end_time)
                    const startMinutes = start.getHours() * 60 + start.getMinutes()
                    const durationMinutes = Math.max((end.getTime() - start.getTime()) / 60000, 20)
                    const top = ((startMinutes - gridStart) / (gridEnd - gridStart)) * bandHeight
                    const height = (durationMinutes / (gridEnd - gridStart)) * bandHeight
                    return (
                      <div
                        key={booking.id}
                        title={`${booking.student?.name || "Student"}, ${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`}
                        className="absolute inset-x-2 flex flex-col justify-center overflow-hidden rounded-md bg-primary px-3 text-primary-foreground"
                        style={{ top: `${top}px`, height: `${Math.max(height - 3, 20)}px` }}
                      >
                        <span className="truncate text-[13px] font-semibold leading-tight">
                          {booking.student?.name || "Student"}
                        </span>
                        <span className="truncate text-[11px] leading-tight opacity-80">
                          {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg bg-muted px-6 py-14 text-center">
              <p className="font-serif text-xl font-semibold">Closed today</p>
              <span className="max-w-[420px] text-[13px] leading-[21px] text-muted-foreground">
                {todayException?.reason
                  ? `Marked closed: ${todayException.reason}.`
                  : "No open hours today."}{" "}
                Lessons can still be booked — they&apos;ll just ask you to confirm.
              </span>
              <Link
                href="/admin/availability"
                className="text-[13px] font-semibold text-accent transition-colors hover:text-accent-strong"
              >
                Adjust availability
              </Link>
            </div>
          )}
        </AdminCard>

        <AdminCard className="flex w-full shrink-0 flex-col py-[22px] lg:w-[296px]">
          <Eyebrow className="mb-2">At a glance</Eyebrow>
          {[
            { label: "Lessons today", value: String(todaysBookings.length) },
            { label: "Awaiting reply", value: String(pendingInquiryCount) },
            { label: "Unpaid", value: formatCurrencyCompact(totalUnpaid) },
            { label: "Active students", value: String(students.length) },
          ].map((row, index, rows) => (
            <div
              key={row.label}
              className={`flex items-baseline justify-between py-4 ${index < rows.length - 1 ? "border-b" : ""}`}
            >
              <span className="text-[13px] text-muted-foreground">{row.label}</span>
              <span className="font-serif text-[26px] font-semibold leading-none">{row.value}</span>
            </div>
          ))}
        </AdminCard>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <AdminCard className="flex min-w-0 flex-1 flex-col gap-2.5">
          <Eyebrow>Needs you</Eyebrow>
          {needsYou.length === 0 ? (
            <>
              <p className="font-serif text-[19px] font-semibold">Nothing waiting</p>
              <p className="text-[13px] leading-5 text-muted-foreground">
                New inquiries, reschedule requests and overdue invoices collect here.
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-0.5">
              {needsYou.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-muted/50"
                >
                  {item.label}
                  <ArrowRight className="size-[15px] shrink-0 text-accent" aria-hidden />
                </Link>
              ))}
            </div>
          )}
        </AdminCard>

        {setupTasks.length > 0 && (
          <AdminCard className="flex min-w-0 flex-1 flex-col gap-3">
            <Eyebrow>Finish setting up</Eyebrow>
            {setupTasks.map((task) => (
              <Link
                key={task.key}
                href={task.href}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-muted/50"
              >
                {task.label}
                <ArrowRight className="size-[15px] shrink-0 text-accent" aria-hidden />
              </Link>
            ))}
          </AdminCard>
        )}
      </div>
    </div>
  )
}
