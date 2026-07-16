import { AwardsSection } from "@/components/public/awards-section"

export const metadata = {
  title: "Awards | ABA Music Academy",
  description:
    "Competition results, festival honors, and distinctions earned by ABA Music Academy students and faculty.",
}

export default function AwardsPage() {
  // Dedicated page: the section heading is the page H1 and shows the full set.
  return <AwardsSection headingLevel={1} />
}
