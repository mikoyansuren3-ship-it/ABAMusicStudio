import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import { hasRealAwards } from "@/lib/awards"
import { AwardsSection } from "@/components/public/awards-section"

export const metadata: Metadata = publicPageMetadata({
  title: "Student Awards & Honors",
  description:
    "Competition results, festival honors, and distinctions earned by ABA Music Academy students and faculty.",
  path: "/awards",
  // Placeholder awards must not be indexed; flips automatically once real awards land.
  robots: hasRealAwards ? undefined : { index: false, follow: true },
})

export default function AwardsPage() {
  // Dedicated page: the section heading is the page H1 and shows the full set.
  return <AwardsSection headingLevel={1} />
}
