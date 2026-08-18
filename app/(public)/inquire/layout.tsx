import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import type React from "react"

export const metadata: Metadata = publicPageMetadata({
  title: "Inquire About Lessons — Free Trial",
  description:
    "Tell us about the prospective student and preferred times — we'll match you with the right piano lesson and schedule a free trial in the Santa Clarita Valley.",
  path: "/inquire",
})

export default function InquireLayout({ children }: { children: React.ReactNode }) {
  return children
}
