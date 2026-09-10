import type { Metadata } from "next"
import Link from "next/link"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/public/page-header"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { publicPageMetadata } from "@/lib/seo/metadata"
import { SITE } from "@/lib/site"

export const metadata: Metadata = publicPageMetadata({
  title: "Employment — Teach at ABA Music Academy",
  description: `Join the teaching team at ABA Music Academy in the ${SITE.location.areaLong}. We welcome applications from experienced music and enrichment instructors.`,
  path: "/employment",
})

export default function EmploymentPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Breadcrumbs trail={[{ name: "Employment", href: "/employment" }]} className="mb-6" />
        <PageHeader
          eyebrow="Employment"
          title="Teach at ABA Music Academy"
          lede={`Our academy is growing, and we're always glad to hear from instructors who care about every note. We teach piano, voice, violin, and qanun today — with guitar, chess, and math enrichment programs on the way.`}
        />

        {/* What we look for / what we offer */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-serif text-2xl font-bold">Who We&apos;re Looking For</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li>Experienced instructors in piano, voice, violin, guitar, or enrichment subjects</li>
                <li>Formal training or degree in your teaching field, or equivalent professional experience</li>
                <li>Patience and warmth with young beginners — most of our students are school-age</li>
                <li>Comfort preparing students for recitals, MTAC festivals, evaluations, and competitions</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-serif text-2xl font-bold">What We Offer</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li>A private, well-equipped studio in the {SITE.location.areaLong}</li>
                <li>Students matched to your schedule, with scheduling and billing handled by our online portal</li>
                <li>Recitals every June and December, plus festival and competition opportunities for your students</li>
                <li>A collegial, family-run academy led by a PhD-trained, MTAC-member founder</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How to apply */}
        <section className="mx-auto mt-16 max-w-2xl text-center" aria-labelledby="employment-apply">
          <h2 id="employment-apply" className="font-serif text-3xl font-bold">
            How to Apply
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Email us a short introduction with your resume or CV — include your teaching subject, experience, and
            weekly availability. We review every application and reply within a few business days.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <a href={`mailto:${SITE.email}?subject=Teaching application — ABA Music Academy`}>
              <Mail className="mr-2 h-4 w-4" aria-hidden />
              Apply at {SITE.email}
            </a>
          </Button>
          <p className="mt-6 text-sm text-muted-foreground">
            Curious about the studio first?{" "}
            <Link href="/about" className="font-medium text-accent underline-offset-4 hover:underline">
              Read about our teaching philosophy
            </Link>{" "}
            or{" "}
            <Link href="/faculty" className="font-medium text-accent underline-offset-4 hover:underline">
              meet our teachers
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
