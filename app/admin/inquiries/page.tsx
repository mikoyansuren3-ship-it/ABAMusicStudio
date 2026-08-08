import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { PageHeader, PillTabs } from "@/components/admin/ui"
import { InquiriesList, type InquiryTab } from "@/components/admin/inquiries-view"
import type { Inquiry } from "@/lib/types"

const TAB_TO_STATUS: Record<InquiryTab, Inquiry["status"]> = {
  waiting: "pending",
  approved: "approved",
  waitlist: "waitlist",
  declined: "denied",
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const tab: InquiryTab = (["waiting", "approved", "waitlist", "declined"] as const).includes(
    params.status as InquiryTab,
  )
    ? (params.status as InquiryTab)
    : "waiting"

  const supabase = await createClient()
  const { data: inquiries } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false })

  const all = (inquiries || []) as Inquiry[]
  const counts: Record<InquiryTab, number> = {
    waiting: all.filter((inquiry) => inquiry.status === "pending").length,
    approved: all.filter((inquiry) => inquiry.status === "approved").length,
    waitlist: all.filter((inquiry) => inquiry.status === "waitlist").length,
    declined: all.filter((inquiry) => inquiry.status === "denied").length,
  }
  const visible = all.filter((inquiry) => inquiry.status === TAB_TO_STATUS[tab])

  const summary = `Requests from the website · ${
    counts.waiting === 0
      ? "nothing waiting on you"
      : `${counts.waiting} ${counts.waiting === 1 ? "request" : "requests"} waiting on you`
  }`

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <PageHeader
        title="Inquiries"
        summary={summary}
        actions={
          <Link
            href="/inquire"
            target="_blank"
            className="inline-flex h-10 items-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            <ExternalLink className="size-[15px]" aria-hidden />
            View the public form
          </Link>
        }
      />

      <PillTabs
        tabs={[
          { href: "/admin/inquiries", label: "Waiting", count: counts.waiting, active: tab === "waiting" },
          {
            href: "/admin/inquiries?status=approved",
            label: "Approved",
            count: counts.approved,
            active: tab === "approved",
          },
          {
            href: "/admin/inquiries?status=waitlist",
            label: "Waitlist",
            count: counts.waitlist,
            active: tab === "waitlist",
          },
          {
            href: "/admin/inquiries?status=declined",
            label: "Declined",
            count: counts.declined,
            active: tab === "declined",
          },
        ]}
      />

      <InquiriesList inquiries={visible} tab={tab} declinedCount={counts.declined} />
    </div>
  )
}
