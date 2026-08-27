import type { Metadata } from "next"
import { publicPageMetadata } from "@/lib/seo/metadata"

import { notFound } from "next/navigation"

import { BodySection } from "@/components/programs/programme-notes/body-section"
import { Closing } from "@/components/programs/programme-notes/closing"
import { CredentialsBand } from "@/components/programs/programme-notes/credentials-band"
import { Lede } from "@/components/programs/programme-notes/lede"
import { Masthead } from "@/components/programs/programme-notes/masthead"
import { NotationWatermark } from "@/components/programs/programme-notes/notation-watermark"
import { Rail } from "@/components/programs/programme-notes/rail"
import styles from "@/components/programs/programme-notes/programme-notes.module.css"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { JsonLd } from "@/components/seo/json-ld"
import { getProgram, publishedPrograms, type Program } from "@/lib/programs"
import { faqSchema, programSchema } from "@/lib/seo/schema"

type Params = { slug: string }

/** I, II, III… — the numbering runs through the closing "How to get started". */
const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]

/**
 * The credentials band interrupts the body immediately after the teacher
 * section: the reader meets the teacher, then walks straight into her
 * credentials. Sections after it (piano's "On stage" and "Common questions")
 * run full-width — the instrument rail has finished its length by then, which
 * is what the comp does too.
 */
function splitAtTeachers(program: Program) {
  const teacherIndex = program.sections.findIndex((section) => section.block.kind === "teachers")
  const cut = teacherIndex === -1 ? program.sections.length : teacherIndex + 1
  return { railed: program.sections.slice(0, cut), rest: program.sections.slice(cut) }
}

export function generateStaticParams(): Params[] {
  return publishedPrograms.map((program) => ({ slug: program.slug }))
}

// Only published programs exist; anything else is a 404 (not a soft "coming soon").
export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const program = getProgram(slug)
  if (!program) return {}
  // image: null — this segment ships its own opengraph-image.tsx / twitter-image.tsx.
  return publicPageMetadata({
    title: program.metaTitle,
    description: program.metaDescription,
    path: `/programs/${program.slug}`,
    image: null,
  })
}

/**
 * The "Programme Notes" program page — an editorial broadsheet on parchment.
 * All four instrument pages share this template; everything that varies is
 * data in lib/programs.ts. See design-system/pages/programs.md for the design
 * contract and the deviations from MASTER.md it is granted.
 */
export default async function ProgramPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const program = getProgram(slug)
  if (!program) notFound()

  const { railed, rest } = splitAtTeachers(program)

  return (
    <div className={styles.page}>
      <JsonLd data={programSchema(program)} />
      {program.faqs.length > 0 ? <JsonLd data={faqSchema(program.faqs)} /> : null}

      {/* One watermark tile repeats behind the whole parchment run. */}
      <NotationWatermark id={program.slug} />

      <div className={`${styles.above} ${styles.shell} pt-8`}>
        <Breadcrumbs trail={[{ name: program.navLabel, href: `/programs/${program.slug}` }]} />
      </div>

      <Masthead program={program} />
      <Lede program={program} />

      {/* Body: the instrument rail runs the full height of these sections. */}
      <div className={`${styles.above} ${styles.shell} pb-4`}>
        <div className={styles.railGrid}>
          <Rail instrument={program.rail} />
          <div>
            {railed.map((section, index) => (
              <BodySection
                key={section.heading}
                section={section}
                index={index}
                program={program}
              />
            ))}
          </div>
        </div>
      </div>

      <CredentialsBand program={program} />

      <div className={`${styles.above} ${styles.shell} pt-2 pb-20`}>
        {rest.map((section, index) => (
          <BodySection
            key={section.heading}
            section={section}
            index={railed.length + index}
            program={program}
          />
        ))}
        <Closing
          program={program}
          headingIndex={
            NUMERALS[program.sections.length] ?? String(program.sections.length + 1)
          }
        />
      </div>
    </div>
  )
}
