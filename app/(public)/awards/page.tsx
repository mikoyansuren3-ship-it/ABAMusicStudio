import type { Metadata } from "next"
import { ExternalLink } from "lucide-react"

import { publicPageMetadata } from "@/lib/seo/metadata"
import { hasRealAwards, competitions, testingPrograms, type Recognition } from "@/lib/awards"
import { AwardsSection } from "@/components/public/awards-section"

export const metadata: Metadata = publicPageMetadata({
  title: "Student Awards & Honors",
  description:
    "Awards and honors earned by ABA Music Academy students — MTAC festivals, Certificate of Merit, RCM, ABRSM, Piano Guild, and international competitions.",
  path: "/awards",
  // Placeholder awards must not be indexed; flips automatically once real awards land.
  robots: hasRealAwards ? undefined : { index: false, follow: true },
})

export default function AwardsPage() {
  return (
    <>
      {/* Dedicated page: the section heading is the page H1 and shows the full set. */}
      <AwardsSection
        headingLevel={1}
        lede="Certificates, trophies, and honors from our concerts and recitals — and the competitions and evaluations our students train for year-round."
      />

      {/* Competitions & festivals our students compete in */}
      <section className="py-16 md:py-24" aria-labelledby="awards-competitions">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">On the Competition Stage</p>
            <h2 id="awards-competitions" className="mt-3 font-serif text-3xl font-bold">
              Competitions &amp; Festivals
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our students prepare for and earn honors at international competitions and MTAC festivals.
            </p>
          </div>
          <RecognitionRows items={competitions} />
        </div>
      </section>

      {/* Graded testing & certification programs */}
      <section className="bg-muted/30 py-16 md:py-24" aria-labelledby="awards-testing">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Measured Progress</p>
            <h2 id="awards-testing" className="mt-3 font-serif text-3xl font-bold">
              Testing &amp; Certification Programs
            </h2>
            <p className="mt-4 text-muted-foreground">
              Students who want a structured path test through nationally and internationally recognized programs.
            </p>
          </div>
          <RecognitionRows items={testingPrograms} />
        </div>
      </section>
    </>
  )
}

function RecognitionRows({ items }: { items: Recognition[] }) {
  return (
    <ul className="mx-auto mt-12 max-w-4xl divide-y overflow-hidden rounded-xl border bg-card">
      {items.map((item) => (
        <li key={item.name} className="flex flex-col gap-2 p-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <div className="max-w-2xl">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.note}</p>
          </div>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Program website
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
