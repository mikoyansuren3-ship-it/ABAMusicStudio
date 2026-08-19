import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import { ServicesShowcase } from "@/components/services/services-showcase"

export const metadata: Metadata = publicPageMetadata({
  title: "Upcoming Programs — Guitar, Chess & Math",
  description:
    "Preview upcoming ABA Music Academy programs in the Santa Clarita Valley: guitar lessons, chess instruction, and math enrichment.",
  path: "/services",
})

export default function ServicesPage() {
  return <ServicesShowcase />
}
