import { cookies } from "next/headers"
import { REMEMBER_EMAIL_COOKIE } from "@/lib/supabase/auth-cookies"

export async function getRememberedLoginEmail() {
  const cookieStore = await cookies()
  return cookieStore.get(REMEMBER_EMAIL_COOKIE)?.value ?? ""
}
