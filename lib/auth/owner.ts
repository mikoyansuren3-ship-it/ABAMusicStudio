import { createAdminClient } from "@/lib/supabase/admin"

const defaultOwnerAdminEmail = "arpine@abamusicacademy.org"

export function getOwnerAdminEmail() {
  return defaultOwnerAdminEmail
}

export function isOwnerEmail(email?: string | null) {
  const ownerEmail = getOwnerAdminEmail()
  return Boolean(ownerEmail && email?.toLowerCase() === ownerEmail)
}

export async function promoteOwnerIfNeeded(userId: string, email?: string | null) {
  if (!isOwnerEmail(email)) {
    return
  }

  const admin = createAdminClient()
  const { error } = await admin.from("profiles").upsert({ id: userId, role: "admin" }, { onConflict: "id" })

  if (error) {
    throw new Error(`Unable to promote owner account: ${error.message}`)
  }
}
