import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { CtaSection } from "@/components/public/cta-section"
import { PageHeader } from "@/components/public/page-header"
import { GraduationCap, Heart, Award } from "lucide-react"

export const metadata = {
  title: "About | ABA Music Academy",
  description: "Learn about our teaching philosophy and experience at ABA Music Academy.",
}

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <PageHeader
          title="About ABA Music Academy"
          lede="Dedicated to nurturing musical talent and fostering a lifelong love of music."
        />

        {/* Bio Section */}
        <div className="mt-16 grid items-center gap-12 md:grid-cols-2">
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              <Image
                src="/arpine-portrait.png"
                alt="Arpine, founder of ABA Music Academy"
                width={768}
                height={1024}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          <div>
            <h2 className="font-serif text-3xl font-bold">Meet Your Founder</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              ABA Music Academy was founded by Arpine, who brings over 10 years of teaching experience and the joy of
              guiding students of all ages through their musical journeys. She holds a PhD in Music and brings a deep
              foundation in classical training to every lesson — shaped in part by her time at the Aram Khachaturian
              Museum and Komitas State Conservatory in Armenia, two of the region&apos;s respected music institutions.
              An MTAC member, she stays actively involved in the local music education community, and the academy she
              built carries that same commitment to patient, personalized instruction across its growing faculty.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              ABA Music Academy is growing.{" "}
              <Link href="/faculty" className="font-medium text-accent underline-offset-4 hover:underline">
                Meet the full faculty
              </Link>{" "}
              of piano, voice, and violin instructors.
            </p>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold">Teaching Philosophy</h2>
            <p className="mt-4 text-muted-foreground">Three pillars guide every lesson at ABA Music Academy.</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <GraduationCap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold">Strong Foundations</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Proper technique from the start prevents bad habits and enables musical freedom as skills advance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold">Joy in Learning</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Music should be enjoyable. I balance challenging material with pieces students love to keep motivation
                  high.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold">Individual Growth</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Every student is unique. Lessons are tailored to individual goals, learning styles, and musical
                  interests.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24">
          <CtaSection
            body="Ready to begin your musical journey?"
            buttonLabel="Inquire About Lessons"
            href="/inquire"
          />
        </div>
      </div>
    </div>
  )
}
