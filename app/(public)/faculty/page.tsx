import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import Image from "next/image"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { CtaSection } from "@/components/public/cta-section"
import { PageHeader } from "@/components/public/page-header"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { JsonLd } from "@/components/seo/json-ld"
import { personListSchema } from "@/lib/seo/schema"
import { publishedTeachers } from "@/lib/teachers"

export const metadata: Metadata = publicPageMetadata({
  title: "Faculty — Piano, Voice, Violin & Qanun Teachers",
  description:
    "Meet the teachers behind ABA Music Academy in the Santa Clarita Valley — conservatory-trained piano, voice, violin, and qanun instructors.",
  path: "/faculty",
})

export default function FacultyPage() {
  return (
    <div className="py-16 md:py-24">
      <JsonLd data={personListSchema(publishedTeachers)} />
      <div className="container mx-auto px-4">
        <Breadcrumbs trail={[{ name: "Faculty", href: "/faculty" }]} className="mb-6" />
        <PageHeader
          eyebrow="Our Faculty"
          title="Teachers Who Care About Every Note"
          lede="Meet the instructors guiding students at ABA Music Academy across piano, voice, violin, and qanun."
        />

        {/* Faculty grid */}
        <div className="mt-16 grid items-start justify-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {publishedTeachers.map((teacher) => (
            <Card key={teacher.slug} className="overflow-hidden pt-0">
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <Image
                  src={teacher.image}
                  alt={teacher.imageAlt}
                  width={768}
                  height={1024}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  {teacher.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                    >
                      {subject}
                    </span>
                  ))}
                  {teacher.isFounder && (
                    <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium">Founder</span>
                  )}
                </div>
                <h2 className="mt-4 font-serif text-2xl font-bold">{teacher.name}</h2>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{teacher.role}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{teacher.bio}</p>
              </CardContent>
            </Card>
          ))}

          {/* Growing-faculty note keeps the grid honest while new instructors are onboarded. */}
          <Card className="border-dashed bg-muted/30 shadow-none">
            <CardContent className="flex h-full flex-col items-start justify-center gap-3 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Growing Faculty</p>
              <h2 className="font-serif text-2xl font-bold">More Instructors Joining Soon</h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Guitar, chess, and math enrichment teachers are joining as those programs launch. Instructor profiles
                will appear here as each one is confirmed — or{" "}
                <Link href="/inquire" className="font-medium text-accent underline-offset-4 hover:underline">
                  inquire now
                </Link>{" "}
                to be matched when spots open.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-24">
          <CtaSection
            body="Ready to find the right teacher for you?"
            buttonLabel="Inquire About Lessons"
            href="/inquire"
          />
        </div>
      </div>
    </div>
  )
}
