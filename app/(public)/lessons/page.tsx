import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check } from "lucide-react"
import { PageHeader } from "@/components/public/page-header"
import { LessonFormatsSection } from "@/components/lesson-formats-section"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { SITE } from "@/lib/site"

export const metadata: Metadata = publicPageMetadata({
  title: "Lessons — Formats & What's Included",
  description:
    "Private music lessons in the Santa Clarita Valley: 30- and 45-minute weekly lessons, flexible scheduling, and a free trial lesson. Inquire for current rates.",
  path: "/lessons",
})

export default function LessonsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Breadcrumbs trail={[{ name: "Lessons", href: "/lessons" }]} className="mb-6" />
        <PageHeader
          title="Lessons"
          lede={`Private music lessons for the ${SITE.location.area} — choose the lesson format that best fits your needs and goals.`}
        />

        <div className="mt-16">
          <LessonFormatsSection />
        </div>

        <div className="mt-16 rounded-xl border bg-muted/30 p-8 text-center md:p-12">
          <h2 className="font-serif text-2xl font-bold">Free Trial Lesson</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Not sure where to start? Book a free trial lesson to meet your teacher, assess your current level, and
            discuss your musical goals.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/inquire">Book a Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/programs/piano-lessons">About Our Piano Program</Link>
            </Button>
          </div>
        </div>

        {/* What's Included */}
        <div className="mt-16">
          <h2 className="text-center font-serif text-2xl font-bold">What&apos;s Included</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h3 className="font-medium">Personalized Curriculum</h3>
                <p className="text-sm text-muted-foreground">
                  Lessons tailored to your goals, skill level, and musical interests.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h3 className="font-medium">Online Student Portal</h3>
                <p className="text-sm text-muted-foreground">
                  Easy scheduling, payment, and communication through your personal dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h3 className="font-medium">Practice Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Access to sheet music recommendations and practice guidance.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h3 className="font-medium">Performance Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Optional recitals and performance events throughout the year.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
