import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { CtaSection } from "@/components/public/cta-section"
import { PageHeader } from "@/components/public/page-header"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { JsonLd } from "@/components/seo/json-ld"
import { siteFaqs } from "@/lib/programs"
import { faqSchema } from "@/lib/seo/schema"
import { SITE } from "@/lib/site"

export const metadata: Metadata = publicPageMetadata({
  title: "Frequently Asked Questions — Piano Lessons",
  description: `Answers about piano lessons at ABA Music Academy in the ${SITE.location.area}: ages, pricing, free trial, location, cancellations, payment, hours, and recitals.`,
  path: "/faq",
})

const RELATED = [
  { label: "Piano Lessons", href: "/programs/piano-lessons" },
  { label: "Lessons & Pricing", href: "/lessons" },
  { label: "Studio Policies", href: "/policies" },
  { label: "Meet the Faculty", href: "/faculty" },
] as const

export default function FaqPage() {
  return (
    <div className="py-16 md:py-24">
      <JsonLd data={faqSchema(siteFaqs)} />
      <div className="container mx-auto px-4">
        <Breadcrumbs trail={[{ name: "FAQ", href: "/faq" }]} className="mb-6" />
        <PageHeader
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          lede={`Everything families ask before starting lessons at ABA Music Academy in the ${SITE.location.area}.`}
        />

        <div className="mx-auto mt-16 max-w-3xl space-y-4">
          {siteFaqs.map((faq) => (
            <Card key={faq.question}>
              <CardContent className="pt-6">
                <h2 className="font-serif text-xl font-bold">{faq.question}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <nav aria-label="Related pages" className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-accent">Learn more</h2>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {RELATED.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-medium underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-24">
          <CtaSection
            title="Still have a question?"
            body="Send us a note or book a free trial lesson — we're happy to help."
            buttonLabel="Inquire About Lessons"
            href="/inquire"
          />
        </div>
      </div>
    </div>
  )
}
