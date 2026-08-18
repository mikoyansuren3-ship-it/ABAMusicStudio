import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import type React from "react"

export const metadata: Metadata = publicPageMetadata({
  title: "Contact Us — Santa Clarita Valley Piano Studio",
  description:
    "Questions about piano lessons or the studio? Call 818-836-2322, email, or send a message to ABA Music Academy in the Santa Clarita Valley.",
  path: "/contact",
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
