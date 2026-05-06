import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
              <img src="/professional-piano-teacher-portrait-warm-lighting.jpg" alt="Piano teacher" className="h-full w-full object-cover" />
            </div>
          </div>

          <div>
            <h2 className="font-serif text-3xl font-bold">Meet Your Teacher</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              With over 20 years of teaching experience, I have had the privilege of guiding hundreds of students on
              their musical journeys. My approach combines classical training with modern pedagogical methods, ensuring
              each student develops both technical proficiency and genuine musical expression.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              I hold a Master&apos;s degree in Piano Performance and have studied under renowned pedagogues. My students
              have gone on to win competitions, earn music scholarships, and most importantly, develop a lasting
              appreciation for music.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Whether you&apos;re a young beginner or an adult returning to the piano, I believe every student deserves
              patient, personalized instruction that meets them where they are.
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
