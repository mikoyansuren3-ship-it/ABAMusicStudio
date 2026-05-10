import { createClient } from "@/lib/supabase/server"
import { type EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

const allowedNextPaths = new Set(["/portal", "/portal/profile", "/dashboard", "/auth/update-password"])

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type") as EmailOtpType | null
  const next = url.searchParams.get("next") || "/portal"
  const redirectPath = allowedNextPaths.has(next) ? next : "/portal"
  const errorMessage = url.searchParams.get("error_description") || url.searchParams.get("error")

  if (errorMessage) {
    return NextResponse.redirect(`${url.origin}/auth/error?message=${encodeURIComponent(errorMessage)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(url.origin + redirectPath)
    }

    return NextResponse.redirect(`${url.origin}/auth/error?message=${encodeURIComponent(error.message)}`)
  }

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (!error) {
      const redirectUrl = url.origin + redirectPath
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(`${url.origin}/auth/error?message=Invalid%20or%20expired%20confirmation%20link`)
}
