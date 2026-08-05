import { createClient } from "@/lib/supabase/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdminLedgerView, type LedgerRow } from "@/components/admin-ledger-view"
import type { Booking, Profile, Student, StudentBilling } from "@/lib/types"

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

interface Period {
  mode: "month" | "week"
  rangeStart: Date
  rangeEnd: Date
  /** "2026-08" in month mode, the week's Sunday "2026-08-02" in week mode. */
  anchor: string
  nowMs: number
}

function resolvePeriod(params: { view?: string; month?: string; week?: string }): Period {
  const now = new Date()
  const nowMs = now.getTime()

  if (params.view === "week") {
    let start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const match = params.week?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const year = Number(match[1])
      const parsed = new Date(year, Number(match[2]) - 1, Number(match[3]))
      if (year >= 2000 && year <= 2100 && !Number.isNaN(parsed.getTime())) start = parsed
    }
    start.setDate(start.getDate() - start.getDay()) // snap to Sunday
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return { mode: "week", rangeStart: start, rangeEnd: end, anchor: toDateKey(start), nowMs }
  }

  let year = now.getFullYear()
  let month = now.getMonth() + 1
  const match = params.month?.match(/^(\d{4})-(\d{2})$/)
  if (match) {
    const parsedYear = Number(match[1])
    const parsedMonth = Number(match[2])
    if (parsedYear >= 2000 && parsedYear <= 2100 && parsedMonth >= 1 && parsedMonth <= 12) {
      year = parsedYear
      month = parsedMonth
    }
  }
  return {
    mode: "month",
    rangeStart: new Date(year, month - 1, 1),
    rangeEnd: new Date(year, month, 1),
    anchor: `${year}-${String(month).padStart(2, "0")}`,
    nowMs,
  }
}

type StudentWithBilling = Student & { profile: Profile; billing: StudentBilling | null }

/**
 * Materialize lessons in the range from each student's fixed weekly slot.
 * Idempotent: a student with any booking (even cancelled) on a slot date is
 * skipped for that date, so admin cancellations and reschedules stick.
 * Months before the billing record existed are left untouched.
 */
async function ensureLessons(
  supabase: Awaited<ReturnType<typeof createClient>>,
  students: StudentWithBilling[],
  rangeStart: Date,
  rangeEnd: Date,
  existingBookings: Booking[],
) {
  const bookedDates = new Set(existingBookings.map((b) => `${b.student_id}|${toDateKey(new Date(b.start_time))}`))

  const inserts: Array<Partial<Booking>> = []
  for (const student of students) {
    const billing = student.billing
    if (!student.is_active || !billing) continue
    if (billing.day_of_week === null || !billing.lesson_time) continue

    const billingStart = new Date(billing.created_at)
    const billingMonthStart = new Date(billingStart.getFullYear(), billingStart.getMonth(), 1)

    for (const day = new Date(rangeStart); day < rangeEnd; day.setDate(day.getDate() + 1)) {
      if (day.getDay() !== billing.day_of_week) continue
      if (new Date(day.getFullYear(), day.getMonth(), 1) < billingMonthStart) continue
      if (bookedDates.has(`${student.id}|${toDateKey(day)}`)) continue
      const start = new Date(`${toDateKey(day)}T${billing.lesson_time}`)
      const end = new Date(start.getTime() + billing.duration_minutes * 60000)
      inserts.push({
        student_id: student.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: "confirmed",
        is_recurring: true,
        recurring_day_of_week: billing.day_of_week,
      })
    }
  }

  if (inserts.length === 0) return false
  await supabase.from("bookings").insert(inserts)
  return true
}

export default async function AdminLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; month?: string; week?: string }>
}) {
  const params = await searchParams
  const { mode, rangeStart, rangeEnd, anchor, nowMs } = resolvePeriod(params)

  const supabase = await createClient()

  const { data: studentsData } = await supabase
    .from("students")
    .select("*, profile:profiles(*), billing:student_billing(*)")
    .order("name")

  const students: StudentWithBilling[] = (studentsData || []).map((s) => ({
    ...s,
    billing: Array.isArray(s.billing) ? (s.billing[0] ?? null) : (s.billing ?? null),
  }))

  const fetchRangeBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .gte("start_time", rangeStart.toISOString())
      .lt("start_time", rangeEnd.toISOString())
      .order("start_time")
    return (data || []) as Booking[]
  }

  let rangeBookings = await fetchRangeBookings()
  const inserted = await ensureLessons(supabase, students, rangeStart, rangeEnd, rangeBookings)
  if (inserted) rangeBookings = await fetchRangeBookings()

  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("amount")
    .eq("status", "paid")
    .gte("paid_at", rangeStart.toISOString())
    .lt("paid_at", rangeEnd.toISOString())

  const rows: LedgerRow[] = students
    .map((student) => {
      const lessons = rangeBookings.filter((b) => b.student_id === student.id && b.status !== "cancelled")
      // A missed lesson earns nothing unless it was made up.
      const paidLessons = lessons.filter((l) => !(l.attendance === "missed" && !l.made_up_on))
      const expectedCents = student.billing ? student.billing.rate_cents * paidLessons.length : 0
      return {
        student: {
          id: student.id,
          name: student.name,
          is_active: student.is_active,
          preferred_lesson_duration: student.preferred_lesson_duration,
        },
        billing: student.billing,
        lessons,
        expectedCents,
      }
    })
    .filter((row) => row.student.is_active || row.lessons.length > 0)

  const collectedCents = (paidInvoices || []).reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-lg font-semibold">Income</h1>
        </div>
      </header>

      <div className="p-6">
        <AdminLedgerView mode={mode} anchor={anchor} rows={rows} collectedCents={collectedCents} nowMs={nowMs} />
      </div>
    </>
  )
}
