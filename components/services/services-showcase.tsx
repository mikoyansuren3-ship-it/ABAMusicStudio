import Link from "next/link"

type Service = {
  id: "violin" | "vocal" | "guitar" | "chess" | "math" | "science" | "english"
  number: string
  name: string
  description: string
  bullets: string[]
}

const services: Service[] = [
  {
    id: "violin",
    number: "01",
    name: "Violin",
    description:
      "Expression, technique, and beautiful tone. Classical violin instruction rooted in the same conservatory tradition as our piano program.",
    bullets: [
      "Posture, bowing, and intonation fundamentals",
      "Repertoire across Baroque, Classical, and Romantic periods",
      "Ensemble preparation and recital performance",
    ],
  },
  {
    id: "vocal",
    number: "02",
    name: "Vocal",
    description:
      "Healthy technique, confidence, and expressive singing. Voice lessons that support musicality from warmups to performance.",
    bullets: [
      "Breath support, tone production, and range building",
      "Song interpretation across classical and contemporary styles",
      "Audition, recital, and stage confidence preparation",
    ],
  },
  {
    id: "guitar",
    number: "03",
    name: "Guitar",
    description:
      "Rhythm, chords, and expressive playing. Guitar instruction designed to build strong fundamentals and musical independence.",
    bullets: [
      "Chord fluency, strumming patterns, and finger placement",
      "Reading, tablature, and ear-training foundations",
      "Repertoire for accompaniment, solo playing, and performance",
    ],
  },
  {
    id: "chess",
    number: "04",
    name: "Chess",
    description:
      "Strategy, focus, and creative problem solving. A disciplined approach to the game that sharpens thinking across every subject.",
    bullets: [
      "Opening theory, tactics, and endgame technique",
      "Tournament preparation and competitive play",
      "Critical thinking and pattern recognition",
    ],
  },
  {
    id: "math",
    number: "05",
    name: "Math",
    description:
      "Number sense, practice, and problem solving. Building confidence and fluency in mathematical thinking from the ground up.",
    bullets: [
      "Foundational arithmetic through algebra readiness",
      "Conceptual understanding, not just memorization",
      "Competition math and enrichment for advanced students",
    ],
  },
  {
    id: "science",
    number: "06",
    name: "Science",
    description:
      "Curiosity, experiments, and big ideas. Hands-on exploration across physics, chemistry, and biology for young investigators.",
    bullets: [
      "Observation-based learning and the scientific method",
      "Guided experiments with real lab materials",
      "Connecting classroom science to the real world",
    ],
  },
  {
    id: "english",
    number: "07",
    name: "English",
    description:
      "Reading, writing, and clear communication. Strengthening literacy skills and building confidence in expression, across every age.",
    bullets: [
      "Reading comprehension and analytical writing",
      "Grammar, vocabulary, and essay structure",
      "Creative writing and public speaking foundations",
    ],
  },
]

export function ServicesShowcase() {
  return (
    <section>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-14 pb-24 pt-12 max-[900px]:px-5 max-[900px]:pb-18 max-[900px]:pt-8">
        <header className="mx-auto max-w-3xl pb-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Coming Soon</p>
          <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight md:text-6xl">Upcoming Services</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            ABA Music Academy is preparing a wider set of learning options. Teacher details and schedules will be updated
            here as each service is confirmed.
          </p>
        </header>

        {services.map((service) => (
          <article
            key={service.id}
            className={`services-card t-${service.id} grid min-h-[calc(100vh-120px)] grid-cols-[1fr_1fr] overflow-hidden rounded-[28px] border max-[900px]:grid-cols-1`}
          >
            <div className="flex min-h-full flex-col justify-between p-12 text-[var(--card-fg)] max-[900px]:p-7">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--card-accent)]">
                  {service.number}
                </p>
                <h2 className="mt-8 font-serif text-[clamp(40px,4.5vw,72px)] font-bold leading-[0.95] tracking-tight">
                  {service.name}
                </h2>
                <p className="mt-8 max-w-[440px] font-serif text-[22px] leading-[1.35] text-[var(--card-fg-dim)]">
                  {service.description}
                </p>
              </div>

              <div className="mt-12">
                <ul>
                  {service.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-3 border-t border-[var(--card-border)] py-4 font-sans text-sm text-[var(--card-fg)]"
                    >
                      <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--card-accent)]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-3 rounded-full bg-[var(--card-btn-bg)] px-6 py-[14px] font-sans text-sm font-medium text-[var(--card-btn-fg)]"
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--card-btn-fg)] [animation:services-pip-pulse_2s_ease-in-out_infinite]" />
                    Stay Tuned
                  </button>
                  <Link
                    href="/contact"
                    className="border-b border-[var(--card-fg-dim)] font-sans text-[13px] font-medium text-[var(--card-fg-dim)] transition-colors hover:border-[var(--card-accent)] hover:text-[var(--card-accent)]"
                  >
                    Contact for details →
                  </Link>
                </div>
              </div>
            </div>

            <div
              aria-label={`${service.name} 3D render placeholder`}
              className="min-h-full border-l border-[var(--card-border)] bg-[var(--card-right-bg)] [background-image:repeating-linear-gradient(135deg,transparent_0,transparent_18px,color-mix(in_srgb,var(--card-accent)_18%,transparent)_18px,color-mix(in_srgb,var(--card-accent)_18%,transparent)_19px)] max-[900px]:min-h-[360px] max-[900px]:border-l-0 max-[900px]:border-t"
            />
          </article>
        ))}

        <footer className="mx-auto max-w-3xl pt-6 text-center">
          <p className="font-serif text-xl italic leading-relaxed text-muted-foreground">
            More details — including teachers, schedules, and pricing — will be announced as each service is confirmed.
          </p>
        </footer>
      </div>
    </section>
  )
}
