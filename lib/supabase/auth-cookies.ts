import type { CookieOptions } from "@supabase/ssr"

export const REMEMBER_EMAIL_COOKIE = "aba_remember_email"

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export function getAuthCookieDefaults(): Pick<CookieOptions, "path" | "sameSite" | "secure"> {
  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }
}

/** Apply cookie options for Supabase auth tokens (persistent vs browser-session). */
export function withPersistLoginOptions(
  options: CookieOptions | undefined,
  persistLogin: boolean,
): CookieOptions {
  const defaults = getAuthCookieDefaults()

  if (!persistLogin) {
    return {
      ...options,
      ...defaults,
      maxAge: undefined,
      expires: undefined,
    }
  }

  return {
    ...options,
    ...defaults,
  }
}

export function rememberEmailCookieOptions(): CookieOptions {
  return {
    ...getAuthCookieDefaults(),
    httpOnly: true,
    maxAge: ONE_YEAR_SECONDS,
  }
}
