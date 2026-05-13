import type React from "react"

import { PublicFooter } from "@/components/public-footer"
import { PublicHeader } from "@/components/public-header"

export default function EnrollLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}

