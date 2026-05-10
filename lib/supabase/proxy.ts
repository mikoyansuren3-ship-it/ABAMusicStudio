import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow public routes only
  if (!supabaseUrl || !supabaseKey) {
    // Block protected routes if Supabase isn't configured
    if (
      request.nextUrl.pathname.startsWith("/portal") ||
      request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/dashboard")
    ) {
      const url = request.nextUrl.clone()
      url.pathname = request.nextUrl.pathname.startsWith("/dashboard")
        ? "/auth/teacher/login"
        : request.nextUrl.pathname.startsWith("/admin")
          ? "/auth/admin/login"
          : "/auth/student/login"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user role for route protection
  let userRole: string | null = null
  if (user) {
    try {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      userRole = profile?.role || null
    } catch {
      // Table might not exist yet
      userRole = null
    }
  }

  // Protect student portal routes
  if (request.nextUrl.pathname.startsWith("/portal") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/student/login"
    return NextResponse.redirect(url)
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/admin/login"
      return NextResponse.redirect(url)
    }
    if (userRole !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/portal"
      return NextResponse.redirect(url)
    }
  }

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/teacher/login"
      return NextResponse.redirect(url)
    }
    if (userRole !== "teacher") {
      const url = request.nextUrl.clone()
      url.pathname = userRole === "admin" ? "/admin" : "/portal"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
