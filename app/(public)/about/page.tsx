import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { GraduationCap, Heart, Award } from "lucide-react"

export const metadata = {
  title: "About | ABA Music Studio",
  description: "Learn about our teaching philosophy and experience at ABA Music Studio.",
}

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl font-bold">About ABA Music Studio</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Dedicated to nurturing musical talent and fostering a lifelong love of music.
          </p>
        </div>

        {/* Bio Section */}
        <div className="mt-16 grid items-center gap-12 md:grid-cols-2">
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              <Image
                src="/arpine-portrait.png"
                alt="Arpine, ABA Music Studio piano teacher"
                width={768}
                height={1024}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          <div>
            <h2 className="font-serif text-3xl font-bold">Meet Your Teacher</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              With over 10 years of teaching experience, I&apos;ve had the joy of guiding students of all ages through
              their musical journeys. I hold a PhD in Music and bring a deep foundation in classical training to every
              lesson — shaped in part by my time on faculty at the Aram Khachaturian Conservatory in Armenia, one of the
              region&apos;s most prestigious music institutions. I currently serve as Recording Secretary for MTAC Santa
              Clarita Valley, staying actively involved in the local music education community. Whether you&apos;re just
              starting out or looking to refine your technique, I&apos;m committed to patient, personalized instruction that
              helps every student grow.
            </p>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold">Teaching Philosophy</h2>
            <p className="mt-4 text-muted-foreground">Three pillars guide every lesson at ABA Music Studio.</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card className="border-0 bg-muted/30">
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

            <Card className="border-0 bg-muted/30">
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

            <Card className="border-0 bg-muted/30">
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
        <div className="mt-24 text-center">
          <p className="text-lg text-muted-foreground">Ready to begin your musical journey?</p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/inquire">Inquire About Lessons</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
