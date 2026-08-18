import type { Metadata } from "next"
import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StageBar } from "@/components/admin/stage-bar"
import { AdminSidebar, AdminMobileNav } from "@/components/admin/sidebar-nav"
import { summarizeAvailability } from "@/lib/admin/format"

// Authenticated / private surface — never index.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/admin/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/portal")
  }

  const [{ count: studentCount }, { data: availability }] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("availability").select("*").eq("is_active", true),
  ])

  const availabilitySummary = summarizeAvailability(availability || [])
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  return (
    <div className="flex min-h-svh flex-col">
      <StageBar profile={profile} dateLabel={dateLabel} />
      <AdminMobileNav studentCount={studentCount || 0} />
      <div className="flex flex-1">
        <AdminSidebar
          studentCount={studentCount || 0}
          footerLines={[availabilitySummary.daysLine, availabilitySummary.hoursLine]}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
