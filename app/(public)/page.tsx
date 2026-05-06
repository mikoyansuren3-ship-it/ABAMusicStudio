import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Calendar, CreditCard, Users, Star, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-balance md:text-6xl">
              Begin Your Musical Journey Today
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
              Professional piano instruction tailored to your goals. Whether you&apos;re a beginner or advancing your
              skills, discover the joy of making music.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/inquire">Inquire About Lessons</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold">Why Choose ABA Music Studio?</h2>
            <p className="mt-4 text-muted-foreground">
              A personalized approach to piano education with modern tools and traditional excellence.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card className="border-0 bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold">Personalized Instruction</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Every student receives a customized curriculum designed around their goals, pace, and musical
                  interests.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold">Flexible Scheduling</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Book lessons online at times that work for your schedule. Easy rescheduling when life gets busy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <CreditCard className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold">Simple Payments</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Pay securely online with card, or choose monthly subscription billing for added convenience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Lessons Overview */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-bold">Lessons for Every Level</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                From first notes to advanced repertoire, find the right lesson format for your musical journey.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Star className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium">Beginner Lessons</h4>
                    <p className="text-sm text-muted-foreground">
                      Build a strong foundation with proper technique and music reading skills.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Music className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium">Intermediate Lessons</h4>
                    <p className="text-sm text-muted-foreground">
                      Expand your repertoire and develop expression and musicality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium">Advanced Lessons</h4>
                    <p className="text-sm text-muted-foreground">
                      Refine artistry and prepare for performances, competitions, or auditions.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="mt-8" asChild>
                <Link href="/lessons">View Pricing</Link>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                <img src="/elegant-grand-piano-in-warm-studio-lighting.jpg" alt="Piano studio" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
            <h2 className="font-serif text-2xl font-bold md:text-3xl">Ready to Start?</h2>
            <p className="mt-4 text-primary-foreground/80">
              Schedule a trial lesson to see if we&apos;re the right fit for you.
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/inquire">Book a Trial Lesson</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
