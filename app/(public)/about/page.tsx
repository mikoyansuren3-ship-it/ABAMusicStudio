import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"
import Link from "next/link"
import Image from "next/image"
import { PageHeader } from "@/components/public/page-header"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { SITE, SITE_DEFINITION } from "@/lib/site"

export const metadata: Metadata = publicPageMetadata({
  title: "About Our Piano Studio",
  description:
    "Meet Arpine, founder of ABA Music Academy — PhD in Music, MTAC member, 10+ years teaching piano to students of all ages in the Santa Clarita Valley.",
  path: "/about",
})

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Breadcrumbs trail={[{ name: "About", href: "/about" }]} className="mb-6" />
        <PageHeader
          title="About ABA Music Academy"
          lede={SITE_DEFINITION}
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
                sizes="(min-width: 768px) 50vw, 100vw"
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
                Meet our teachers
              </Link>{" "}
              in piano, voice, violin, and qanun.
            </p>
          </div>
        </div>

        {/* Teaching candids — the philosophy in practice, mid-lesson */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="aspect-[16/10] overflow-hidden rounded-xl border bg-muted">
            <Image
              src="/students/founder-guiding-student.jpg"
              alt="Arpine guiding a young student at the piano on stage"
              width={900}
              height={563}
              sizes="(min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover object-[center_30%]"
            />
          </div>
          <div className="aspect-[16/10] overflow-hidden rounded-xl border bg-muted">
            <Image
              src="/students/founder-four-hands.jpg"
              alt="Arpine playing a duet with a student, four hands at one piano"
              width={900}
              height={563}
              sizes="(min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover object-[center_35%]"
            />
          </div>
        </div>

        {/* Origin story */}
        <section className="mt-24" aria-labelledby="about-origin">
          <div className="mx-auto max-w-3xl">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-accent">Our Story</p>
            <h2
              id="about-origin"
              className="mt-3 text-center font-serif text-3xl font-bold text-balance"
            >
              Established in 2019: From Humble Beginnings to a Thriving Community
            </h2>

            <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                ABA Music Academy began in a garage in Newhall.
              </p>
              <p>
                Arpine arrived in the United States with a PhD in Music and years of conservatory training behind
                her — study at the Komitas State Conservatory and time at the Aram Khachaturian Museum in Armenia —
                and one ambition she had carried since she was a student herself: to build a teaching studio of her
                own. Shortly after settling in Newhall in 2019, she left her job to make that dream real.
              </p>
              <p>
                The first lessons were taught out of her garage, one student and one weekly time slot at a time.
                Word travelled the way it does in a close community — a parent mentioned her to a neighbor, the
                neighbor told a friend — and the schedule filled. What began as a single teacher with a piano became
                a foothold in the {SITE.location.area}.
              </p>
              <p>
                Today ABA Music Academy is a full academy: a team teaching piano, voice, violin, and qanun,
                recitals every June and December, and students who compete in international competitions and test
                through MTAC Certificate of Merit, RCM, and ABRSM. Arpine remains an active member of the Music
                Teachers&apos; Association of California and serves on the board of its Santa Clarita Valley branch,
                and she still teaches the way she did in that garage — one student at a time, at their pace, toward
                what they want to play.
              </p>
            </div>
          </div>
        </section>

        {/* Studio life */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
            <Image
              src="/students/student-focus-at-the-keys.jpg"
              alt="A student concentrating at the keys, hands in position, during a recital"
              width={900}
              height={675}
              sizes="(min-width: 768px) 33vw, 100vw"
              className="h-full w-full object-cover object-[center_30%]"
            />
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
            <Image
              src="/students/students-holiday-recital-joy.jpg"
              alt="Students laughing together in Santa hats at the holiday recital"
              width={900}
              height={675}
              sizes="(min-width: 768px) 33vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
            <Image
              src="/students/recital-trophy-young-student.jpg"
              alt="A young student holding her recital trophy beside her teacher"
              width={900}
              height={675}
              sizes="(min-width: 768px) 33vw, 100vw"
              className="h-full w-full object-cover object-[center_25%]"
            />
          </div>
        </div>

        {/* Closing group photo — the whole studio on stage */}
        <div className="relative mt-16 aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src="/students/studio-recital-finale-wide.jpg"
            alt="ABA Music Academy students gathered on stage at the recital finale"
            fill
            sizes="(min-width: 1536px) 1536px, 100vw"
            className="object-cover object-[center_30%]"
          />
        </div>
      </div>
    </div>
  )
}
