import Image from "next/image"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { CtaSection } from "@/components/public/cta-section"
import { PageHeader } from "@/components/public/page-header"
import { publishedTeachers } from "@/lib/teachers"

export const metadata = {
  title: "Faculty | ABA Music Academy",
  description: "Meet the teachers behind ABA Music Academy — piano, voice, and violin instructors.",
}

export default function FacultyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <PageHeader
          eyebrow="Our Faculty"
          title="Teachers Who Care About Every Note"
          lede="Meet the instructors guiding students at ABA Music Academy across piano, voice, and violin."
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
          <Card className="border-dashed bg-muted/30 shadow-none sm:col-span-2 lg:col-span-2">
            <CardContent className="flex h-full flex-col items-start justify-center gap-3 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Growing Faculty</p>
              <h2 className="font-serif text-2xl font-bold">Voice & Violin Instructors Joining Soon</h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                We are expanding beyond piano with carefully selected voice and violin teachers. Instructor profiles
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
