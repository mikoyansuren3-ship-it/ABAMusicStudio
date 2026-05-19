import type React from "react"
import { Noto_Music } from "next/font/google"
import { redirect } from "next/navigation"
import { PortalSidebar } from "@/components/portal-sidebar"
import { createClient } from "@/lib/supabase/server"

const notoMusic = Noto_Music({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-noto-music",
  display: "swap",
})

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/student/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, is_read_by")
    .or(`audience.eq.all,recipient_ids.cs.{${user.id}}`)

  const unreadCount =
    notifications?.filter((n) => !n.is_read_by?.includes(user.id)).length ?? 0

  return (
    <div className={`${notoMusic.variable} flex h-screen overflow-hidden bg-[#F5EFE3]`}>
      <PortalSidebar user={user} profile={profile} unreadCount={unreadCount} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pt-0 pt-14">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
