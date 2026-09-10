import Link from "next/link"

import { Reveal } from "@/components/public/reveal"
import type { Program } from "@/lib/programs"

import styles from "./programme-notes.module.css"

/**
 * "How to get started" — the numbered steps that close the body, followed by
 * the "Ready to start?" band bounded top and bottom by double rules.
 *
 * The steps sit outside the rail grid: by this point the reader has finished
 * the programme and the instrument graphic has run its full length.
 */
export function Closing({ program, headingIndex }: { program: Program; headingIndex: string }) {
  const columns =
    program.steps.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3"

  return (
    <>
      <section className={styles.section} aria-labelledby="section-how-to-get-started">
        <div className="flex items-baseline gap-4 pt-7 pb-6">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-strong">
            {headingIndex}
          </span>
          <Reveal
            as="h2"
            from="bow"
            id="section-how-to-get-started"
            className="font-serif text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-balance text-foreground"
          >
            How to get started
          </Reveal>
        </div>

        <div className={`${styles.steps} ${columns}`}>
          {program.steps.map((step, index) => (
            <Reveal
              key={step}
              from="up"
              delay={Math.min(index * 70, 280)}
              className={styles.step}
            >
              <p className="font-serif text-[46px] font-extrabold leading-none text-foreground">
                {index + 1}
              </p>
              <p className="mt-3 text-[15px] leading-[1.75] text-muted-foreground">{step}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal from="up" className={styles.closingBand}>
        <h2 className="font-serif text-[36px] font-extrabold tracking-[-0.02em] text-foreground">
          Ready to start?
        </h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-base leading-relaxed text-muted-foreground">
          Book a free trial {program.subject.toLowerCase()} lesson and see if we&rsquo;re the right
          fit.
        </p>
        <Link
          href="/inquire"
          className="mt-7 inline-flex h-11 items-center rounded-md bg-primary px-7 text-[13px] font-semibold uppercase tracking-[0.06em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Book a Free Trial
        </Link>
      </Reveal>
    </>
  )
}
