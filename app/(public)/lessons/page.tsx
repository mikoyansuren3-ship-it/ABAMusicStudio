import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check } from "lucide-react"
import { PageHeader } from "@/components/public/page-header"
import { PricingSection } from "@/components/pricing-section"

export const metadata = {
  title: "Lessons & Pricing | ABA Music Academy",
  description: "View lesson types, durations, and pricing at ABA Music Academy.",
}

export default function LessonsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <PageHeader
          title="Lessons & Pricing"
          lede="Choose the lesson format that best fits your needs and goals."
        />

        <div className="mt-16">
          <PricingSection />
        </div>

        <div className="mt-16 rounded-xl border bg-muted/30 p-8 text-center md:p-12">
          <h2 className="font-serif text-2xl font-bold">Free Trial Lesson</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Not sure where to start? Book a free trial lesson to meet your teacher, assess your current level, and
            discuss your musical goals.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/inquire">Book a Free Trial</Link>
          </Button>
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
