import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import { ServicesShowcase } from "@/components/services/services-showcase"

export const metadata: Metadata = publicPageMetadata({
  title: "Upcoming Programs — Violin, Voice, Guitar, Chess & Tutoring",
  description:
    "Preview upcoming ABA Music Academy programs in the Santa Clarita Valley: violin, voice, guitar, chess, and math, science, and English tutoring.",
  path: "/services",
})

export default function ServicesPage() {
  return <ServicesShowcase />
}
