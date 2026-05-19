import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/student/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const { data: student } = await supabase.from("students").select("*").eq("parent_id", user.id).maybeSingle()

  return <ProfileForm user={user} profile={profile} student={student} />
}
