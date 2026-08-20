import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AwardsSection } from "@/components/public/awards-section"
import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import { SITE, SITE_DEFINITION } from "@/lib/site"

const HOME_TITLE = `${SITE.name} | Piano Lessons in ${SITE.location.area}`

export const metadata: Metadata = {
  ...publicPageMetadata({
    title: HOME_TITLE,
    description: `Private piano lessons in the ${SITE.location.areaLong} for kids, teens, and adults. PhD-trained, MTAC-member instruction, free trial lesson, flexible 30/45-minute formats, and easy online scheduling.`,
    path: "/",
  }),
  // Homepage keeps the full brand title (no template suffix).
  title: { absolute: HOME_TITLE },
}

export default function HomePage() {
  return (
    <>
      {/* Hero Section — a stage surface (design-system MASTER.md §1): the June
          2026 concert stage behind the headline, darkened for cream text. */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <Image
          src="/students/recital-june-2026-stage.jpg"
          alt="A student performing at the grand piano during ABA Music Academy's 2026 end-of-year concert"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_38%]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-wood-darkest/80 via-wood-darkest/55 to-wood-darkest/80"
          aria-hidden
        />
        <div className="relative container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-strong">
              Begin Your Musical Journey Today
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-balance text-cream md:text-6xl">
              Piano Lessons in the {SITE.location.area}
            </h1>
            <p className="mt-6 text-lg text-cream/90 leading-relaxed text-pretty">{SITE_DEFINITION}</p>
            <p className="mt-3 text-cream/90 leading-relaxed text-pretty">
              Whether you&apos;re a beginner or advancing your skills, every lesson is tailored to your goals — and
              your first trial lesson is free.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/inquire">Inquire About Lessons</Link>
              </Button>
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-gold/50 px-6 py-3 text-sm font-semibold text-gold-strong transition-colors hover:border-gold hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Students on Stage — social proof from the June 2026 concert.
          Alt text describes the moment, never the student (docs/content/photo-usage.md). */}
      <section className="py-16 md:py-24" aria-labelledby="students-on-stage">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="students-on-stage" className="font-serif text-3xl font-bold">
              Our Students on Stage
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every June and December, our students perform on a real stage — from first recitals to advanced
              repertoire.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
            {[
              {
                src: "/students/recital-june-2026-young-beginner.jpg",
                alt: "A young beginner performing at ABA Music Academy's 2026 end-of-year concert",
              },
              {
                src: "/students/recital-june-2026-teen-soloist.jpg",
                alt: "A teen student performing advanced repertoire at the grand piano",
              },
              {
                src: "/students/recital-june-2026-duet.jpg",
                alt: "Two students performing a duet, four hands at one piano",
              },
            ].map((photo) => (
              <div key={photo.src} className="aspect-[4/5] overflow-hidden rounded-xl border bg-muted">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={900}
                  height={1125}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards teaser band */}
      <AwardsSection
        limit={3}
        viewAllHref="/awards"
        lede="A selection of the competition results, festival honors, and distinctions earned by our students and faculty."
      />

      {/* CTA Section — the June finale (certificates and bouquets), softened
          behind the panel so the page ends on joy while the button dominates. */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src="/students/recital-june-2026-finale.jpg"
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1536px) 1536px, 100vw"
              className="object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" aria-hidden />
            <div className="relative px-8 py-16 text-center md:py-20">
              <h2 className="font-serif text-2xl font-bold md:text-3xl">Ready to Start?</h2>
              <p className="mt-4 text-muted-foreground">
                Schedule a trial lesson to see if we&apos;re the right fit for you.
              </p>
              <Button size="lg" className="mt-8" asChild>
                <Link href="/inquire">Book a Trial Lesson</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
