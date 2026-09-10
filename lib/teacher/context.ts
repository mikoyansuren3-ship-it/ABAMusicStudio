import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Profile, Teacher } from "@/lib/types"

/**
 * Everything a teacher screen needs before it can render: the session, the
 * profile (role gate), and the roster row this login is linked to.
 *
 * `teacher` is null when no active `teachers` row points at this profile. That
 * is not an error — RLS returns nothing for such a login by design
 * (scripts/016_teacher_scoped_access.sql), so pages render an explainer
 * instead of an empty studio.
 */
export async function getTeacherContext() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/teacher/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
  if (profile?.role !== "teacher") redirect("/portal")

  const { data: teacher } = await supabase
    .from("teachers")
    .select("*")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .maybeSingle()

  return {
    supabase,
    user,
    profile: profile as Profile,
    teacher: (teacher as Teacher | null) ?? null,
  }
}
