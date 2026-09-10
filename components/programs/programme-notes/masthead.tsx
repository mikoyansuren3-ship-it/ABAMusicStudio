import Link from "next/link"

import { Reveal } from "@/components/public/reveal"
import type { Program } from "@/lib/programs"
import { SITE } from "@/lib/site"

import styles from "./programme-notes.module.css"

/**
 * The broadsheet masthead: a rule row naming the issue, then a three-column
 * spread — typographic nameplate, the H1 and its tagline, and three fact
 * stacks — closed by a double rule.
 *
 * Nothing here is reveal-wrapped above the H1: the masthead is the top of the
 * page and the H1 is the LCP element, so it has to paint opaque (MASTER §7).
 */
export function Masthead({ program }: { program: Program }) {
  return (
    <header className={styles.above}>
      <div className={styles.shell}>
        <div className={styles.ruleRow}>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-strong">
            Programme Notes
          </span>
          <span
            className={`${styles.ruleRowCenter} hidden text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground sm:block`}
          >
            {SITE.location.areaLong}
          </span>
          <span
            className={`${styles.ruleRowEnd} text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground`}
          >
            No. {program.issue} · {program.subject}
          </span>
        </div>

        <div className={styles.masthead}>
          {/* Left gutter — typographic nameplate, not the logo asset. */}
          <div>
            <p className="font-serif text-[27px] font-bold leading-[1.06] text-foreground">
              ABA Music
              <br />
              Academy
            </p>
            <div className={styles.nameplateRule} />
            <p className="font-serif text-sm italic text-muted-foreground">
              Where talent meets tradition
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Est. {SITE.location.area}
            </p>
          </div>

          {/* Centre — the headline the page ranks for. Centred, per the comp. */}
          <div className="text-center">
            <h1 className="font-serif text-[clamp(2.5rem,6.2vw,5.25rem)] font-black leading-[0.94] tracking-[-0.045em] text-balance text-foreground">
              {program.title}
            </h1>
            <p className="mx-auto mt-5 max-w-[30em] font-serif text-[21px] italic leading-[1.45] text-muted-foreground">
              {program.lede}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/inquire"
                className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-[13px] font-semibold uppercase tracking-[0.06em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Book a Free Trial
              </Link>
              <Link
                href="/lessons"
                className="inline-flex h-11 items-center rounded-md border border-foreground px-6 text-[13px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Lesson Options
              </Link>
            </div>
          </div>

          {/* Right gutter — the facts a parent scans for. */}
          <dl className={styles.facts}>
            {program.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
                  {fact.label}
                </dt>
                <dd className="mt-1 font-serif text-[19px] font-bold leading-tight text-foreground">
                  {(Array.isArray(fact.value) ? fact.value : [fact.value]).map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Reveal from="wipe">
          <hr className={styles.doubleRule} />
        </Reveal>
      </div>
    </header>
  )
}
