import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LessonRow } from "@/components/portal/studio/lesson-row"
import {
  PortalCard,
  PortalCardFooterLink,
  PortalEmptyState,
  PortalPageBody,
  PortalPageHeader,
  SectionDivider,
} from "@/components/portal/studio/portal-ui"
import { formatCurrency, formatLongDate, formatShortDate, formatTime } from "@/lib/portal/format"

export default async function PortalDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/student/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const { data: student } = await supabase.from("students").select("*").eq("parent_id", user.id).maybeSingle()

  const { data: bookings } = student
    ? await supabase
        .from("bookings")
        .select("*")
        .eq("student_id", student.id)
        .gte("start_time", new Date().toISOString())
        .in("status", ["confirmed", "pending"])
        .order("start_time")
        .limit(4)
    : { data: [] }

  const { data: invoices } = student
    ? await supabase
        .from("invoices")
        .select("*")
        .eq("student_id", student.id)
        .eq("status", "unpaid")
        .order("due_date")
    : { data: [] }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .or(`audience.eq.all,recipient_ids.cs.{${user.id}}`)
    .not("is_read_by", "cs", `{${user.id}}`)
    .order("created_at", { ascending: false })
    .limit(3)

  const firstName = profile?.full_name?.split(" ")[0] || "Student"
  const nextLesson = bookings?.[0]
  const unpaidBalance = invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0
  const unreadCount = notifications?.length || 0
  const today = formatLongDate(new Date().toISOString())

  return (
    <div className="flex min-h-full flex-col">
      <PortalPageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's your week at a glance."
        right={
          <span className="rounded-full bg-[rgba(201,169,110,0.08)] px-3.5 py-1.5 text-xs font-medium text-[#8B7355]">
            {today}
          </span>
        }
      />

      <PortalPageBody>
        <div className="relative mb-6 grid gap-4 md:grid-cols-3">
          {nextLesson ? (
            <Link
              href="/portal/schedule"
              className="block rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5E34]"
            >
              <PortalCard
                hover
                className="relative overflow-hidden border-0 bg-[repeating-linear-gradient(176deg,transparent,transparent_6px,rgba(0,0,0,0.025)_6px,rgba(0,0,0,0.025)_7px),linear-gradient(135deg,#4E3828,#3B2518)] p-6 text-[#F5EBD9]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1.5 right-3.5 font-[family-name:var(--font-noto-music)] text-[90px] leading-none opacity-[0.06]"
                >
                  {"\u{1D11E}"}
                </span>
                <div className="relative z-1">
                  <p className="text-[11px] font-semibold tracking-[0.08em] uppercase opacity-55">Next Lesson</p>
                  <p className="mt-3 font-serif text-[28px] font-bold">{formatShortDate(nextLesson.start_time)}</p>
                  <p className="mt-1 text-sm opacity-65">
                    {formatTime(nextLesson.start_time)} ·{" "}
                    {Math.round(
                      (new Date(nextLesson.end_time).getTime() - new Date(nextLesson.start_time).getTime()) / 60000,
                    )}{" "}
                    minutes
                  </p>
                </div>
              </PortalCard>
            </Link>
          ) : (
            <PortalCard className="p-6">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#8B7355] uppercase">Next Lesson</p>
              <p className="mt-3 font-serif text-xl font-bold text-[#2b1b14]">None scheduled</p>
              <p className="mt-1 text-sm text-[#8B7355]">Check back soon or contact the studio.</p>
            </PortalCard>
          )}

          <Link
            href="/portal/payments"
            className="block rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5E34]"
          >
            <PortalCard hover className="p-6">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#8B7355] uppercase">Balance Due</p>
              <p
                className={`mt-3 font-serif text-[28px] font-bold ${unpaidBalance > 0 ? "text-[#C47A2C]" : "text-[#4A7A4A]"}`}
              >
                {formatCurrency(unpaidBalance)}
              </p>
              <p className="mt-1 text-sm text-[#8B7355]">
                {invoices?.length || 0} unpaid invoice{(invoices?.length || 0) !== 1 ? "s" : ""}
              </p>
            </PortalCard>
          </Link>

          <Link
            href="/portal/notifications"
            className="block rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5E34]"
          >
            <PortalCard hover className="p-6">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#8B7355] uppercase">Notifications</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-serif text-[28px] font-bold text-[#2b1b14]">{unreadCount}</span>
                <span className="text-sm text-[#8B7355]">unread</span>
              </div>
              <p className="mt-1 text-sm font-medium text-[#8a6b3c]">View all →</p>
            </PortalCard>
          </Link>
        </div>

        <SectionDivider clef="treble" label="Upcoming Lessons" />

        <PortalCard className="mb-6 overflow-hidden">
          {bookings && bookings.length > 0 ? (
            <>
              <div className="px-2 py-1.5">
                {bookings.map((booking, i) => (
                  <LessonRow key={booking.id} booking={booking} isFirst={i === 0} />
                ))}
              </div>
              <PortalCardFooterLink href="/portal/schedule">View Full Schedule →</PortalCardFooterLink>
            </>
          ) : (
            <PortalEmptyState message="No upcoming lessons scheduled." />
          )}
        </PortalCard>

        <SectionDivider clef="bass" label="Recent Notifications" />

        <PortalCard className="overflow-hidden">
          {notifications && notifications.length > 0 ? (
            <>
              <div className="space-y-1 p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-[10px] bg-[rgba(201,169,110,0.03)] px-3.5 py-3.5"
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A96E]" />
                      <span className="text-[13.5px] font-semibold text-[#2b1b14]">{notification.title}</span>
                      <span className="ml-auto text-[11px] text-[#7d6b58]">
                        {formatShortDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="ml-3.5 text-xs leading-relaxed text-[#8B7355] line-clamp-2">{notification.body}</p>
                  </div>
                ))}
              </div>
              <PortalCardFooterLink href="/portal/notifications">View All Notifications →</PortalCardFooterLink>
            </>
          ) : (
            <PortalEmptyState message="No new notifications." />
          )}
        </PortalCard>

        {!student ? (
          <PortalCard className="mt-6 border-[rgba(201,169,110,0.25)] p-6">
            <h3 className="font-serif text-lg font-bold text-[#2b1b14]">Complete Your Profile</h3>
            <p className="mt-2 text-sm text-[#8B7355]">
              Your account is set up, but we need a few more details to get you started.
            </p>
            <Link
              href="/portal/profile"
              className="mt-4 inline-flex rounded-lg bg-[#3B2518] px-4 py-2 text-xs font-semibold text-[#F5EBD9] hover:bg-[#4E3425]"
            >
              Complete Profile
            </Link>
          </PortalCard>
        ) : null}
      </PortalPageBody>
    </div>
  )
}
