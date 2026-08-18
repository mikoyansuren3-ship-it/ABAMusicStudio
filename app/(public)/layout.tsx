import type React from "react"
import { CookieNotice } from "@/components/cookie-notice"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { JsonLd } from "@/components/seo/json-ld"
import { organizationSchema, websiteSchema } from "@/lib/seo/schema"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* MusicSchool + WebSite graph on every public page (local SEO). */}
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <CookieNotice />
    </div>
  )
}
