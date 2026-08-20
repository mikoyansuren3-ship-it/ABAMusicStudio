import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CtaSection } from "@/components/public/cta-section"
import { PageHeader } from "@/components/public/page-header"
import { LessonFormatsSection } from "@/components/lesson-formats-section"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { JsonLd } from "@/components/seo/json-ld"
import { getProgram, publishedPrograms } from "@/lib/programs"
import { faqSchema, programSchema } from "@/lib/seo/schema"
import { publishedTeachers } from "@/lib/teachers"

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return publishedPrograms.map((program) => ({ slug: program.slug }))
}

// Only published programs exist; anything else is a 404 (not a soft "coming soon").
export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const program = getProgram(slug)
  if (!program) return {}
  // image: null — this segment ships its own opengraph-image.tsx / twitter-image.tsx.
  return publicPageMetadata({
    title: program.metaTitle,
    description: program.metaDescription,
    path: `/programs/${program.slug}`,
    image: null,
  })
}

export default async function ProgramPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const program = getProgram(slug)
  if (!program) notFound()

  const instructors = publishedTeachers.filter((teacher) => teacher.subjects.includes(program.subject))
  const isPiano = program.subject === "Piano"

  return (
    <div className="py-16 md:py-24">
      <JsonLd data={programSchema(program)} />
      {program.faqs.length > 0 ? <JsonLd data={faqSchema(program.faqs)} /> : null}

      <div className="container mx-auto px-4">
        <Breadcrumbs trail={[{ name: program.navLabel, href: `/programs/${program.slug}` }]} className="mb-6" />
        <PageHeader eyebrow={program.eyebrow} title={program.title} lede={program.lede} />

        {/* Intro + hero image */}
        <div className="mt-16 grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            {program.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" asChild>
                <Link href="/inquire">Book a Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/lessons">Lesson Options</Link>
              </Button>
            </div>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <Image
              src={program.image}
              alt={program.imageAlt}
              width={1200}
              height={900}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>

        {/* Content sections */}
        <div className="mx-auto mt-20 max-w-3xl space-y-14">
          {program.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-2xl font-bold md:text-3xl">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {/* Recital photos — real students, anonymous captions */}
        {program.gallery && program.gallery.length > 0 ? (
          <section className="mt-20" aria-labelledby="program-gallery">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="program-gallery" className="font-serif text-2xl font-bold md:text-3xl">
                From Our Recitals
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
              {program.gallery.map((photo) => (
                <figure key={photo.src} className="overflow-hidden rounded-xl border bg-card">
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={900}
                      height={1125}
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="p-4 text-sm text-muted-foreground">{photo.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {/* Instructors */}
        {instructors.length > 0 ? (
          <section className="mt-20" aria-labelledby="program-teachers">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="program-teachers" className="font-serif text-2xl font-bold md:text-3xl">
                Your {program.subject} Teacher{instructors.length > 1 ? "s" : ""}
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2">
              {instructors.map((teacher) => (
                <Card key={teacher.slug} className="overflow-hidden pt-0">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={teacher.image}
                      alt={teacher.imageAlt}
                      width={768}
                      height={576}
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className={`h-full w-full object-cover ${teacher.imagePosition ?? "object-top"}`}
                    />
                  </div>
                  <CardContent>
                    <h3 className="font-serif text-2xl font-bold">{teacher.name}</h3>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">{teacher.role}</p>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{teacher.bio}</p>
                    <Link
                      href="/faculty"
                      className="mt-4 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
                    >
                      Meet our teachers
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {/* Lesson formats (piano program embeds the shared section) */}
        {isPiano ? (
          <div className="mt-20">
            <LessonFormatsSection />
          </div>
        ) : null}

        {/* FAQ */}
        {program.faqs.length > 0 ? (
          <section className="mx-auto mt-20 max-w-3xl" aria-labelledby="program-faq">
            <h2 id="program-faq" className="text-center font-serif text-2xl font-bold md:text-3xl">
              {program.subject} Lesson FAQs
            </h2>
            <div className="mt-8 space-y-4">
              {program.faqs.map((faq) => (
                <Card key={faq.question}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              More questions?{" "}
              <Link href="/faq" className="font-medium text-accent underline-offset-4 hover:underline">
                Read the full FAQ
              </Link>
              .
            </p>
          </section>
        ) : null}

        <div className="mt-24">
          <CtaSection
            variant="panel"
            title="Ready to Start?"
            body={`Book a free trial ${program.subject.toLowerCase()} lesson and see if we're the right fit.`}
            buttonLabel="Book a Free Trial"
            href="/inquire"
          />
        </div>
      </div>
    </div>
  )
}
