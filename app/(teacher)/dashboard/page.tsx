import { TeacherDashboard } from "@/components/teacher-dashboard"

// The teacher dashboard is authenticated and reads Supabase per-request, so it
// must never be statically prerendered at build time (doing so evaluates the
// Supabase client during export and fails when build-time env vars are absent,
// e.g. on preview deployments).
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Teacher Dashboard | ABA Music Academy",
}

export default function DashboardPage() {
  return <TeacherDashboard />
}
