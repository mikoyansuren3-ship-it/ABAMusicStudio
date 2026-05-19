import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { withPersistLoginOptions } from "@/lib/supabase/auth-cookies"
import { getSupabaseConfig } from "./config"

type CreateClientOptions = {
  /** When false, auth cookies expire when the browser closes. Defaults to true. */
  persistLogin?: boolean
}

export async function createClient(options?: CreateClientOptions) {
  const persistLogin = options?.persistLogin ?? true
  const cookieStore = await cookies()
  const { supabaseUrl, supabaseKey } = getSupabaseConfig()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
            cookieStore.set(name, value, withPersistLoginOptions(cookieOptions, persistLogin)),
          )
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have proxy refreshing user sessions.
        }
      },
    },
  })
}
