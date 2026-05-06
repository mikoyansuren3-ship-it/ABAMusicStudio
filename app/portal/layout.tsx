import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PortalSidebar } from "@/components/portal-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: student } = await supabase.from("students").select("*").eq("profile_id", user.id).single()

  return (
    <SidebarProvider>
      <PortalSidebar user={user} profile={profile} />
      <SidebarInset>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
