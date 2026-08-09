import { createClient } from "@/lib/supabase/server"
import { MoneyView, type MoneyLedgerRow, type MoneyStats, type TeacherBucket } from "@/components/admin/money-view"
import type { InvoiceRow } from "@/components/admin/invoices-list"
import type { PanelStudent } from "@/components/admin/student-panel"
import type { Booking, Teacher } from "@/lib/types"
import { ensureLessons } from "@/lib/admin/lessons"
import { lessonRateCents, periodActuals } from "@/lib/admin/economics"
import { formatCurrencyCompact, parseDateKey, toDateKey } from "@/lib/admin/format"
import { dateKeyUtc, studioNow, studioToday, wallClockToUtc } from "@/lib/studio-time"

interface Period {
  mode: "month" | "week"
  rangeStart: Date
  rangeEnd: Date
  /** "2026-08" in month mode, the week's Sunday "2026-08-02" in week mode. */
  anchor: string
  nowMs: number
}

function resolvePeriod(params: { view?: string; month?: string; week?: string }): Period {
  const now = studioToday()
  const nowMs = studioNow().getTime()

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

function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split("-").map(Number)
  const shifted = new Date(year, month - 1 + delta, 1)
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function shiftWeek(weekKey: string, deltaDays: number) {
  const shifted = parseDateKey(weekKey)
  shifted.setDate(shifted.getDate() + deltaDays)
  return toDateKey(shifted)
}

/** e.g. "July 21–27, 2026" or "July 26 – August 1, 2026" across a month boundary. */
function weekLabel(weekKey: string) {
  const start = parseDateKey(weekKey)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const startMonth = start.toLocaleDateString("en-US", { month: "long" })
  const endMonth = end.toLocaleDateString("en-US", { month: "long" })
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`
  }
  return `${startMonth} ${start.getDate()}, ${start.getFullYear()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`
}

export default async function AdminMoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; view?: string; month?: string; week?: string }>
}) {
  const params = await searchParams
  const tab = params.tab === "income" ? "income" : "invoices"
  const { mode, rangeStart, rangeEnd, anchor, nowMs } = resolvePeriod(params)

  const supabase = await createClient()

  const [{ data: studentsData }, { data: teachersData }] = await Promise.all([
    supabase
      .from("students")
      .select("*, profile:profiles(*), billing:student_billing(*), slots:student_slots(*)")
      .order("name"),
    supabase.from("teachers").select("*").order("sort_order").order("name"),
  ])

  const students: PanelStudent[] = (studentsData || []).map((student) => ({
    ...student,
    billing: Array.isArray(student.billing) ? (student.billing[0] ?? null) : (student.billing ?? null),
    slots: student.slots || [],
  }))
  const teachers = (teachersData || []) as Teacher[]

  const fetchRangeBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .gte("start_time", wallClockToUtc(toDateKey(rangeStart), "00:00:00").toISOString())
      .lt("start_time", wallClockToUtc(toDateKey(rangeEnd), "00:00:00").toISOString())
      .order("start_time")
    return (data || []) as Booking[]
  }

  let rangeBookings = await fetchRangeBookings()
  const inserted = await ensureLessons(supabase, rangeStart, rangeEnd)
  if (inserted) rangeBookings = await fetchRangeBookings()

  const { data: invoicesData } = await supabase
    .from("invoices")
    .select("*, student:students(*, profile:profiles(*))")
    .order("created_at", { ascending: false })

  const invoices = (invoicesData || []) as InvoiceRow[]

  // Ledger rows: students with billing, plus inactive ones that still have lessons in range.
  const rows: MoneyLedgerRow[] = students
    .filter((student) => student.billing)
    .map((student) => {
      const lessons = rangeBookings.filter(
        (booking) => booking.student_id === student.id && booking.status !== "cancelled",
      )
      // A missed lesson earns nothing unless it was made up. Each lesson
      // earns its own stamped rate (multi-teacher slots can differ).
      const paidLessons = lessons.filter((lesson) => !(lesson.attendance === "missed" && !lesson.made_up_on))
      return {
        studentId: student.id,
        name: student.name,
        isActive: student.is_active,
        billing: student.billing!,
        slots: student.slots,
        lessons,
        expectedCents: paidLessons.reduce(
          (sum, lesson) => sum + lessonRateCents(lesson, student.billing!.rate_cents),
          0,
        ),
      }
    })
    .filter((row) => row.isActive || row.lessons.length > 0)

  // Per-teacher actuals: group each student's lessons by the lesson's
  // snapshot teacher_id (a mid-period reassignment splits honestly).
  const bucketMap = new Map<string, TeacherBucket>()
  for (const student of students) {
    if (!student.billing) continue
    const lessonsByTeacher = new Map<string | null, Booking[]>()
    for (const booking of rangeBookings) {
      if (booking.student_id !== student.id || booking.status === "cancelled") continue
      const key = booking.teacher_id ?? null
      lessonsByTeacher.set(key, [...(lessonsByTeacher.get(key) ?? []), booking])
    }
    for (const [teacherId, lessons] of lessonsByTeacher) {
      const teacher = teacherId ? teachers.find((t) => t.id === teacherId) : undefined
      const actuals = periodActuals(
        lessons,
        student.billing.rate_cents,
        teacher?.pay_hourly_cents ?? 0,
        student.billing.duration_minutes,
      )
      const bucketKey = teacherId ?? "unassigned"
      const bucket = bucketMap.get(bucketKey) ?? {
        teacherId,
        name: teacher?.name ?? "Unassigned",
        grossCents: 0,
        payCents: 0,
        profitCents: 0,
        lessonCount: 0,
      }
      bucket.grossCents += actuals.grossCents
      bucket.payCents += actuals.payCents
      bucket.profitCents += actuals.profitCents
      bucket.lessonCount += actuals.countedLessons
      bucketMap.set(bucketKey, bucket)
    }
  }
  const byTeacher = [...bucketMap.values()].sort((a, b) => b.grossCents - a.grossCents)

  const allLessons = rows.flatMap((row) => row.lessons)
  const unpaidInvoices = invoices.filter((invoice) => invoice.status === "unpaid")
  const paidInPeriod = invoices.filter(
    (invoice) =>
      invoice.status === "paid" &&
      invoice.paid_at &&
      new Date(invoice.paid_at) >= rangeStart &&
      new Date(invoice.paid_at) < rangeEnd,
  )
  const missedLessons = allLessons.filter((lesson) => lesson.attendance === "missed")

  const stats: MoneyStats = {
    outstandingCents: unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    unpaidCount: unpaidInvoices.length,
    collectedCents: paidInPeriod.reduce((sum, invoice) => sum + invoice.amount, 0),
    paidCount: paidInPeriod.length,
    expectedCents: rows.reduce((sum, row) => sum + row.expectedCents, 0),
    lessonCount: allLessons.length,
    missedCount: missedLessons.length,
    madeUpCount: missedLessons.filter((lesson) => lesson.made_up_on).length,
    deductedCents: rows.reduce(
      (sum, row) =>
        sum +
        row.lessons
          .filter((lesson) => lesson.attendance === "missed" && !lesson.made_up_on)
          .reduce((lessonSum, lesson) => lessonSum + lessonRateCents(lesson, row.billing.rate_cents), 0),
      0,
    ),
    attendanceToMark: allLessons.filter(
      (lesson) => !lesson.attendance && new Date(lesson.start_time).getTime() <= nowMs,
    ).length,
    hasAnyBilling: rows.length > 0,
  }

  const periodLabel = mode === "week" ? weekLabel(anchor) : monthLabel(anchor)
  const monthName = mode === "month" ? monthLabel(anchor).split(" ")[0] : null
  const periodShortLabel = mode === "week" ? "this week" : `in ${monthName}`

  let summaryDetail: string
  if (invoices.length === 0 && stats.expectedCents === 0) {
    summaryDetail = "nothing billed, nothing owed"
  } else if (stats.outstandingCents === 0) {
    summaryDetail =
      stats.collectedCents > 0
        ? `${formatCurrencyCompact(stats.collectedCents)} collected ${periodShortLabel}, nothing owed`
        : `${formatCurrencyCompact(stats.expectedCents)} expected ${periodShortLabel}, nothing owed`
  } else {
    summaryDetail = `${formatCurrencyCompact(stats.collectedCents)} collected ${periodShortLabel} · ${formatCurrencyCompact(stats.outstandingCents)} still owed`
  }

  // URL builders keep the tab and period in the query string.
  const href = (options: { tab?: string; mode?: "month" | "week"; anchor?: string | null }) => {
    const nextTab = options.tab ?? tab
    const nextMode = options.mode ?? mode
    const query = new URLSearchParams({ tab: nextTab })
    if (nextMode === "week") {
      query.set("view", "week")
      if (options.anchor) query.set("week", options.anchor)
    } else if (options.anchor) {
      query.set("month", options.anchor)
    }
    return `/admin/money?${query.toString()}`
  }

  const currentMonthKey = dateKeyUtc(new Date(nowMs)).slice(0, 7)
  const hrefs = {
    prev: href({ anchor: mode === "week" ? shiftWeek(anchor, -7) : shiftMonth(anchor, -1) }),
    next: href({ anchor: mode === "week" ? shiftWeek(anchor, 7) : shiftMonth(anchor, 1) }),
    current: href({ anchor: null }),
    invoicesTab: href({ tab: "invoices", anchor }),
    incomeTab: href({ tab: "income", anchor }),
    monthMode: href({ mode: "month", anchor: mode === "week" ? anchor.slice(0, 7) : anchor }),
    weekMode: href({
      mode: "week",
      anchor: mode === "month" ? (anchor === currentMonthKey ? null : `${anchor}-01`) : anchor,
    }),
  }

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <MoneyView
        tab={tab}
        mode={mode}
        summary={`${periodLabel} · ${summaryDetail}`}
        periodShortLabel={periodShortLabel}
        hrefs={hrefs}
        stats={stats}
        rows={rows}
        byTeacher={byTeacher}
        invoices={invoices}
        students={students}
        teachers={teachers}
        nowMs={nowMs}
      />
    </div>
  )
}
