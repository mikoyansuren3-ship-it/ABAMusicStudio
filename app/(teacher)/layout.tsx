import type { Metadata } from "next"
import type React from "react"
import { StageBar } from "@/components/admin/stage-bar"
import { TeacherSidebar, TeacherMobileNav } from "@/components/teacher/sidebar-nav"
import { getTeacherContext } from "@/lib/teacher/context"

// Authenticated / private surface — never index.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile, teacher } = await getTeacherContext()

  // Scoped by RLS to this teacher's own students, so the count is theirs.
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  return (
    <div className="flex min-h-svh flex-col">
      <StageBar profile={profile} dateLabel={dateLabel} portalLabel="Teacher portal" fallbackName="Teacher" />
      <TeacherMobileNav studentCount={studentCount || 0} />
      <div className="flex flex-1">
        <TeacherSidebar
          studentCount={studentCount || 0}
          footerLines={[
            teacher ? teacher.name : "No roster profile",
            teacher?.instrument ? `${teacher.instrument} faculty` : "Ask an admin to link your login",
          ]}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
