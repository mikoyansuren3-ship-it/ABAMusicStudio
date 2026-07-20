import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { type AuthRole, roleDestinations, roleLabels } from "@/lib/auth/roles"
import { isOwnerEmail, promoteOwnerIfNeeded } from "@/lib/auth/owner"

const validRoles = new Set<AuthRole>(["student", "teacher", "admin"])

function errorRedirect(origin: string, message: string) {
  return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(message)}`)
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const roleParam = url.searchParams.get("role")
  const expectedRole = roleParam && validRoles.has(roleParam as AuthRole) ? (roleParam as AuthRole) : null
  const oauthError = url.searchParams.get("error_description") || url.searchParams.get("error")

  if (oauthError) {
    return errorRedirect(url.origin, oauthError)
  }

  if (!code) {
    return errorRedirect(url.origin, "Invalid or expired sign-in link")
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return errorRedirect(url.origin, error?.message || "Unable to complete Google sign-in.")
  }

  const user = data.user

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    await supabase.auth.signOut()
    return errorRedirect(url.origin, profileError.message)
  }

  let actualRole = (profile?.role as AuthRole) || "student"

  // Owner auto-promotion when signing in through the Admin portal.
  if (expectedRole === "admin" && isOwnerEmail(user.email) && actualRole !== "admin") {
    try {
      await promoteOwnerIfNeeded(user.id, user.email)
      actualRole = "admin"
    } catch (promoteError) {
      await supabase.auth.signOut()
      return errorRedirect(
        url.origin,
        promoteError instanceof Error ? promoteError.message : "Unable to verify administrator access.",
      )
    }
  }

  // Enforce per-portal role: reject if the account's role doesn't match the portal.
  if (expectedRole && actualRole !== expectedRole) {
    await supabase.auth.signOut()
    return errorRedirect(
      url.origin,
      `This is a ${roleLabels[actualRole] || actualRole} account. Please use the correct login option.`,
    )
  }

  return NextResponse.redirect(url.origin + roleDestinations[actualRole])
}
