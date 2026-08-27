import Image from "next/image"
import Link from "next/link"

import { Reveal } from "@/components/public/reveal"
import type { Program, ProgramSection } from "@/lib/programs"
import { publishedTeachers } from "@/lib/teachers"

import styles from "./programme-notes.module.css"

/** I, II, III… — the numeral beside each section heading. */
const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]

export const sectionId = (heading: string) =>
  `section-${heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`

/**
 * One numbered body section: a hairline top rule, a baseline-aligned numeral +
 * H2 row (the heading is drawn in with a bow-stroke wipe), then whichever block
 * the section carries.
 */
export function BodySection({
  section,
  index,
  program,
}: {
  section: ProgramSection
  index: number
  program: Program
}) {
  const id = sectionId(section.heading)

  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className="flex items-baseline gap-4 pt-7 pb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-strong">
          {NUMERALS[index] ?? String(index + 1)}
        </span>
        <Reveal as="h2" from="bow" id={id} className="font-serif text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-balance text-foreground">
          {section.heading}
        </Reveal>
      </div>
      <Block section={section} program={program} />
    </section>
  )
}

function Intro({ paragraphs }: { paragraphs?: string[] }) {
  if (!paragraphs?.length) return null
  return (
    <Reveal from="up">
      <div className="max-w-[62ch] space-y-4 text-[16.5px] leading-[1.8] text-muted-foreground">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Reveal>
  )
}

function Block({ section, program }: { section: ProgramSection; program: Program }) {
  const { block } = section

  switch (block.kind) {
    case "prose":
      return (
        <Reveal from="up">
          <div
            className={`space-y-4 text-[16.5px] leading-[1.8] text-muted-foreground ${
              block.columns === 2 ? "md:columns-2 md:gap-10 md:space-y-0 [&>p]:mb-4" : "max-w-[62ch]"
            }`}
          >
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph} className="break-inside-avoid">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      )

    case "cards":
      return (
        <>
          <Intro paragraphs={block.paragraphs} />
          <div
            className={`mt-9 grid gap-7 ${
              block.cards.length >= 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {block.cards.map((card, index) => (
              <Reveal
                key={card.title}
                from="up"
                delay={Math.min(index * 70, 280)}
                as="article"
                className="border-t border-border pt-5"
              >
                {card.marker ? (
                  <p className="font-serif text-[30px] font-bold leading-none text-accent">
                    {card.marker}
                  </p>
                ) : null}
                <h3
                  className={`font-serif text-[21px] font-bold leading-[1.25] text-foreground ${
                    card.marker ? "mt-3" : ""
                  }`}
                >
                  {card.title}
                </h3>
                <p className="mt-2 text-[15.5px] leading-[1.74] text-muted-foreground">{card.body}</p>
              </Reveal>
            ))}
          </div>
        </>
      )

    case "numbered":
      return (
        <>
          <Intro paragraphs={block.paragraphs} />
          <ol className="mt-9 max-w-[68ch]">
            {block.items.map((item, index) => (
              <Reveal
                key={item}
                as="li"
                from="up"
                delay={Math.min(index * 60, 300)}
                className="flex items-baseline gap-5 border-t border-border py-4"
              >
                <span className="font-serif text-[19px] font-bold tabular-nums text-accent-strong">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[16.5px] leading-[1.74] text-foreground">{item}</span>
              </Reveal>
            ))}
          </ol>
        </>
      )

    case "teachers": {
      const roster = block.teachers
        .map((slug) => publishedTeachers.find((teacher) => teacher.slug === slug))
        .filter((teacher) => teacher !== undefined)

      return (
        <div className="space-y-12">
          {roster.map((teacher, index) => (
            <Reveal
              key={teacher.slug}
              from="up"
              delay={Math.min(index * 80, 160)}
              className="grid gap-9 sm:grid-cols-[300px_minmax(0,1fr)]"
            >
              {/*
                The frame stretches to the row rather than holding a fixed
                aspect: these bios run long, and a short 3:4 plate left a well of
                empty parchment beside them. `min-h` keeps it a portrait when a
                bio is short enough not to set the height itself.
              */}
              <div className="relative h-full min-h-[420px] overflow-hidden border border-foreground">
                <Image
                  src={teacher.closeUp ?? teacher.image}
                  alt={teacher.imageAlt}
                  fill
                  sizes="(min-width: 640px) 300px, 100vw"
                  className={`object-cover ${teacher.imagePosition ?? "object-top"} ${styles.photo}`}
                />
              </div>
              <div>
                <h3 className="font-serif text-[30px] font-bold leading-tight text-foreground">
                  {teacher.name}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
                  {teacher.role}
                </p>
                <p className="mt-5 text-[16px] leading-[1.85] text-muted-foreground">{teacher.bio}</p>
                {index === roster.length - 1 ? (
                  <Link
                    href="/faculty"
                    className="mt-6 inline-block border-b border-current pb-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Meet our teachers
                  </Link>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      )
    }

    case "gallery":
      return (
        <div className="grid gap-7 sm:grid-cols-3">
          {block.photos.map((photo, index) => (
            <Reveal
              key={photo.src}
              as="figure"
              from="up"
              delay={Math.min(index * 70, 210)}
              className="border border-foreground"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className={`object-cover ${styles.photo}`}
                />
              </div>
              <figcaption className="border-t border-foreground p-4 text-[13px] leading-[1.55] text-muted-foreground">
                {photo.caption}
              </figcaption>
            </Reveal>
          ))}
        </div>
      )

    case "faqs":
      return (
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {program.faqs.map((faq, index) => (
            <Reveal
              key={faq.question}
              from="up"
              delay={Math.min(index * 60, 300)}
              className="border-t border-border pt-5"
            >
              <h3 className="font-serif text-[21px] font-bold leading-[1.25] text-foreground">
                {faq.question}
              </h3>
              <p className="mt-2 text-[15.5px] leading-[1.74] text-muted-foreground">{faq.answer}</p>
            </Reveal>
          ))}
          <p className="text-[15.5px] text-muted-foreground md:col-span-2">
            More questions?{" "}
            <Link
              href="/faq"
              className="font-medium text-accent-strong underline-offset-4 hover:underline"
            >
              Read the full FAQ
            </Link>
            .
          </p>
        </div>
      )
  }
}
