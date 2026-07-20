import Image from "next/image"
import Link from "next/link"
import { Medal, ArrowRight } from "lucide-react"
import { PianoNoteVine } from "@/components/public/piano-note-vine"
import { publishedAwards, type Award } from "@/lib/awards"

/**
 * Awards & honors — a dark "stage" band (wood + gold, per design-system
 * MASTER.md §1) that carries more decoration than the parchment page sections:
 * piano-note vines climb both edges and each award hangs in a matted, gold-
 * framed tile. Data-driven from lib/awards.ts and reflows for any number of
 * awards, so the section grows without layout changes.
 *
 * Reused in two places:
 *  - Homepage band: <AwardsSection limit={3} viewAllHref="/awards" /> (H2).
 *  - Dedicated /awards page: <AwardsSection headingLevel={1} /> (page H1, full set).
 */
export function AwardsSection({
  awards = publishedAwards,
  eyebrow = "Recognition",
  title = "Awards & Honors",
  lede = "A growing collection of competition results, festival honors, and distinctions earned by ABA Music Academy students and faculty.",
  headingLevel = 2,
  limit,
  viewAllHref,
}: {
  awards?: Award[]
  eyebrow?: string
  title?: string
  lede?: string
  /** 1 when this section is the page title, 2 when embedded under a page H1. */
  headingLevel?: 1 | 2
  /** Cap the number of tiles shown (homepage teaser). Omit to show all. */
  limit?: number
  /** When set, renders a "View all awards" link below the grid. */
  viewAllHref?: string
}) {
  // Nothing to show yet: render nothing (design-system MASTER.md §9 - no
  // placeholder content on live public pages).
  if (awards.length === 0) return null

  const shown = typeof limit === "number" ? awards.slice(0, limit) : awards
  const Heading = `h${headingLevel}` as "h1" | "h2"
  const headingSize = headingLevel === 1 ? "text-4xl md:text-5xl" : "text-3xl"

  return (
    <section
      id="awards"
      className="relative overflow-hidden bg-gradient-to-br from-wood-dark via-wood-main to-wood-darkest text-cream"
    >
      {/* Soft center-out vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse at 50% 30%, transparent 45%, rgba(0,0,0,0.28) 100%)" }}
        aria-hidden
      />

      {/* Piano-note vines framing the section — decorative, wide screens only */}
      <PianoNoteVine side="left" className="z-0 hidden w-16 opacity-90 lg:block xl:w-24" />
      <PianoNoteVine side="right" className="z-0 hidden w-16 opacity-90 lg:block xl:w-24" />

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
          <Heading className={`mt-3 font-serif ${headingSize} font-bold tracking-tight text-balance text-gold-strong`}>
            {title}
          </Heading>
          <p className="mt-4 text-lg leading-relaxed text-cream/80">{lede}</p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {shown.map((award) => (
            <li key={award.id}>
              <AwardTile award={award} headingLevel={headingLevel + 1} />
            </li>
          ))}
        </ul>

        {viewAllHref ? (
          <div className="mt-10 flex justify-center md:mt-12">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-6 py-3 text-sm font-semibold text-gold-strong transition-colors hover:border-gold hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              View all awards
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function AwardTile({ award, headingLevel }: { award: Award; headingLevel: number }) {
  const TileHeading = `h${Math.min(headingLevel, 6)}` as "h2" | "h3" | "h4"
  const framed = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gold/25 bg-wood-card">
        {award.image ? (
          <Image
            src={award.image}
            alt={award.imageAlt ?? award.title}
            fill
            sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 90vw"
            className="object-contain p-2"
          />
        ) : (
          <PlaceholderArt />
        )}
      </div>

      <div className="mt-4 text-center">
        <TileHeading className="font-serif text-lg font-semibold leading-snug text-wood-card-fg">
          {award.title}
        </TileHeading>
        {(award.issuer || award.year) && (
          <p className="mt-1 text-sm text-wood-card-muted">
            {[award.issuer, award.year].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </>
  )

  const tileClass =
    "flex h-full flex-col rounded-xl border border-gold/30 bg-wood-card p-3 shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition duration-200 ease-out"

  if (award.href) {
    return (
      <a
        href={award.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`group ${tileClass} hover:-translate-y-1 hover:border-gold/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:transform-none`}
      >
        {framed}
      </a>
    )
  }

  return <div className={tileClass}>{framed}</div>
}

/** Placeholder shown until a real award image is supplied. */
function PlaceholderArt() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-wood-card">
      <Medal className="h-10 w-10 text-accent/70" aria-hidden />
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-wood-card-muted">Award image</span>
    </div>
  )
}
