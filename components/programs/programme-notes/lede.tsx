import Image from "next/image"
import Link from "next/link"

import { Reveal } from "@/components/public/reveal"
import type { Program } from "@/lib/programs"

import styles from "./programme-notes.module.css"

/**
 * The lede: the intro copy set in two newspaper columns behind a drop cap,
 * beside a bordered plate carrying the page's one image and the free-trial
 * note.
 *
 * A program with no plate image (qanun, which has no photography — see
 * docs/content/photo-usage.md) renders the caption block alone rather than an
 * empty frame. The design prototype used a drag-and-drop placeholder there;
 * that is a prototyping affordance and deliberately does not ship.
 */
export function Lede({ program }: { program: Program }) {
  const { plate } = program

  return (
    <div className={`${styles.above} ${styles.shell}`}>
      <div className={styles.lede}>
        <Reveal from="up">
          <div className={`${styles.ledeColumns} ${styles.dropCap} text-base leading-[1.84] text-foreground`}>
            {program.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <Reveal from="right" delay={80}>
          <aside className={styles.plate}>
            {plate.image ? (
              <div
                className={`${styles.plateFigure} ${plate.illustration ? styles.plateIllustration : ""}`}
              >
                <Image
                  src={plate.image}
                  alt={plate.imageAlt ?? ""}
                  fill
                  priority
                  sizes="(min-width: 900px) 320px, 100vw"
                  className={
                    plate.illustration ? "object-contain p-4" : `object-cover ${styles.photo}`
                  }
                />
              </div>
            ) : null}
            <div className={styles.plateCaption}>
              <p className="font-serif text-[17px] italic leading-snug text-foreground">
                {plate.note}
              </p>
              <Link
                href="/inquire"
                className="mt-3 inline-block border-b border-current pb-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Book a trial lesson
              </Link>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  )
}
