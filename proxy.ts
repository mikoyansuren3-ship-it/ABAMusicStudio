import { updateSession } from "@/lib/supabase/proxy"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Skip static assets and crawl/metadata files (sitemap, robots, manifest,
  // OG images) so they never pay for the Supabase session round-trip.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|.*(?:opengraph-image|twitter-image)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
}
