import Link from "next/link"

import { Reveal } from "@/components/public/reveal"
import type { CredentialEntry, Program } from "@/lib/programs"

import styles from "./programme-notes.module.css"

/**
 * The dark "stage" band (MASTER.md §1) that interrupts the parchment: a
 * heading row with a 2x2 tally of figures, four grouped columns of
 * distinctions, and a closing pull-quote with the gold CTA.
 *
 * Every line is a checkable fact drawn from the teacher bios in
 * lib/teachers.ts — the band asserts nothing the bios do not (MASTER.md §9).
 */
export function CredentialsBand({ program }: { program: Program }) {
  const { credentials } = program

  return (
    <section className={styles.band} aria-labelledby="program-credentials">
      <div className={styles.bandGlow} aria-hidden />

      <div className={`${styles.above} ${styles.shell}`}>
        <div className={styles.bandHead}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Credentials</p>
            <Reveal
              as="h2"
              from="bow"
              id="program-credentials"
              className="mt-3 font-serif text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] text-balance text-gold-strong"
            >
              {credentials.title}
            </Reveal>
            <Reveal from="up" delay={80}>
              <p className="mt-4 max-w-[52ch] text-[16.5px] leading-[1.75] text-cream/90">
                {credentials.intro}
              </p>
            </Reveal>
          </div>

          <Reveal from="up" delay={140}>
            <dl className={styles.tally}>
              {credentials.tally.map((item) => (
                <div key={item.label}>
                  <dt className="font-serif text-[36px] font-extrabold leading-none text-gold-strong">
                    {item.figure}
                  </dt>
                  <dd className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className={styles.groups}>
          {credentials.groups.map((group, index) => (
            <Reveal
              key={group.label}
              from="up"
              delay={Math.min(index * 70, 280)}
              className={styles.group}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                {group.label}
              </p>
              <div className="mt-4">
                {group.entries.map((entry) => (
                  <Entry key={entry.title + (entry.detail ?? "")} entry={entry} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <div className={styles.bandFoot}>
          <Reveal from="up">
            <p className="max-w-[62ch] font-serif text-[19px] italic leading-[1.6] text-cream/90">
              {credentials.quote}
            </p>
          </Reveal>
          <Reveal from="up" delay={80}>
            <Link
              href="/inquire"
              className={`${styles.goldPill} text-[13px] font-semibold uppercase tracking-[0.06em]`}
            >
              Book a Free Trial
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Entry({ entry }: { entry: CredentialEntry }) {
  return (
    <div className={styles.entry}>
      <h3 className="font-serif text-[23px] font-semibold leading-[1.22] text-cream">
        {entry.title}
      </h3>
      {entry.detail ? (
        <p className="mt-2 text-sm leading-[1.72] text-cream/90">{entry.detail}</p>
      ) : null}
      {entry.bullets ? (
        <ul className="mt-3 space-y-2">
          {entry.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-sm leading-[1.6] text-cream/90">
              <span className={styles.noteBullet} aria-hidden />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
