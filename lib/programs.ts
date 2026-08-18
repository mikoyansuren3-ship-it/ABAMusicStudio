import { SITE } from "@/lib/site"

/**
 * Keyword landing pages ("programs") for each instrument, rendered at
 * /programs/[slug]. Mirrors the `published` gate in lib/teachers.ts: a program
 * only goes live (route + sitemap + nav) once it has real content and a
 * published instructor. Unpublished programs 404.
 */

export type ProgramFaq = { question: string; answer: string }

export type ProgramSection = {
  heading: string
  /** One or more paragraphs. */
  body: string[]
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[]
}

export type Program = {
  /** URL segment under /programs, e.g. "piano-lessons" */
  slug: string
  /** Instrument / subject label matching `Teacher.subjects` (e.g. "Piano"). */
  subject: string
  /** Short label used in nav and breadcrumbs. */
  navLabel: string
  /** <title> (template appends "| ABA Music Academy"). Keep ≤ 60 chars. */
  metaTitle: string
  /** Meta description, ≤ 155 chars. */
  metaDescription: string
  eyebrow: string
  /** Visible H1. */
  title: string
  lede: string
  intro: string[]
  sections: ProgramSection[]
  faqs: ProgramFaq[]
  /** schema.org courseMode values */
  courseMode: Array<"Onsite" | "Online">
  /** Hero image under /public + alt */
  image: string
  imageAlt: string
  published?: boolean
}

const AREA = SITE.location.area

export const programs: Program[] = [
  {
    slug: "piano-lessons",
    subject: "Piano",
    navLabel: "Piano Lessons",
    metaTitle: `Piano Lessons in ${AREA}`,
    metaDescription: `Private piano lessons in the ${AREA} for kids, teens, and adults. Conservatory-trained, MTAC-member instruction, free trial lesson, flexible 30/45/60-minute formats.`,
    eyebrow: "Piano Program",
    title: `Piano Lessons in the ${AREA}`,
    lede: "Private, one-on-one piano instruction for beginners through advanced students — taught with patience, classical rigor, and a curriculum built around each student.",
    intro: [
      `ABA Music Academy offers private piano lessons for students across the ${SITE.location.areaLong} — from Valencia and Newhall to Saugus, Canyon Country, and Stevenson Ranch. Every lesson is one-on-one, so beginners build correct habits from the first note and advancing students get focused coaching on repertoire, technique, and performance.`,
      "Lessons are led by our founder, Arpine, who holds a PhD in Music, brings more than 10 years of teaching experience, and is an active member of the Music Teachers' Association of California (MTAC).",
    ],
    sections: [
      {
        heading: "Who piano lessons are for",
        body: [
          "We teach young beginners, school-age children, teens preparing for auditions or festivals, and adults returning to the piano or starting for the first time. There is no minimum experience — the first lesson is used to assess your level and set goals together.",
        ],
        bullets: [
          "Young beginners (ages 5+) building reading, rhythm, and hand position",
          "Kids and teens working through method books, repertoire, and theory",
          "Students preparing for MTAC festivals, Certificate of Merit, competitions, or auditions",
          "Adult beginners and returning players who want a structured, patient path",
        ],
      },
      {
        heading: "What you'll learn",
        body: [
          "Our approach blends classical training with what each student actually wants to play. Alongside repertoire, lessons cover the fundamentals that make independent musicianship possible.",
        ],
        bullets: [
          "Technique: posture, hand shape, tone, scales, and arpeggios",
          "Note reading, rhythm, and sight-reading",
          "Music theory and ear training woven into repertoire",
          "Expression, phrasing, and musical interpretation",
          "Memorization and performance preparation for recitals",
        ],
      },
      {
        heading: "Lesson lengths and pricing",
        body: [
          "Choose 30-, 45-, or 60-minute weekly lessons, once, twice, or three times per week. Monthly tuition starts at $160 for weekly 30-minute lessons; multi-lesson weeks are discounted. A one-time $35 registration fee applies at enrollment. See the full pricing table on the Lessons & Pricing page.",
        ],
      },
      {
        heading: "How to get started",
        body: [
          "Start with a free trial lesson. You'll meet your teacher, play a little (or nothing at all, if you're brand new), and talk through goals and scheduling. From there we recommend a lesson length and a regular weekly time. Enrollment, scheduling, and payments all run through your online student portal.",
        ],
        bullets: [
          "Submit an inquiry with the student's age, experience, and preferred times",
          "Book a free trial lesson",
          "Choose a lesson plan and a weekly time slot",
          "Enroll online — monthly tuition by card, cash, or check",
        ],
      },
    ],
    faqs: [
      {
        question: "What age can my child start piano lessons?",
        answer:
          "Most children are ready for private piano lessons around age 5 or 6, once they can focus for a 30-minute lesson and recognize letters and numbers. We recommend a free trial lesson to gauge readiness.",
      },
      {
        question: "Do you teach adult beginners?",
        answer:
          "Yes. Adults are some of our most rewarding students, whether you're starting from zero or returning after years away. Lessons move at your pace and are built around the music you want to play, with technique, reading, and theory introduced as you go. Evening and Saturday times are available for working schedules.",
      },
      {
        question: "How much do piano lessons cost?",
        answer:
          "Monthly tuition starts at $160 for one 30-minute lesson per week, $230 for 45 minutes, and $300 for 60 minutes. Two or three lessons per week are discounted. There is a one-time $35 registration fee. The Lessons & Pricing page has the full table.",
      },
      {
        question: "Do I need a piano at home?",
        answer:
          "You need something to practice on between lessons. A full-size, 88-key digital piano with weighted keys is a great start for beginners; an acoustic upright or grand is ideal as students progress and tone control matters more. We're happy to recommend options at any budget before you buy.",
      },
      {
        question: "Where are lessons held?",
        answer: `Lessons are taught in person at our private studio in the ${AREA}, serving families in ${SITE.location.areaServed.slice(0, -1).join(", ")}, and ${SITE.location.areaServed.at(-1)}. Studio hours are ${SITE.hours.map((h) => `${h.label} ${h.display}`).join(" and ")}. We share the exact location and directions when you book your trial lesson.`,
      },
      {
        question: "What is your cancellation policy?",
        answer:
          "Lessons cancelled with at least 24 hours' notice can be rescheduled at no charge, subject to availability. Late cancellations and no-shows are charged 30% of the lesson cost. Makeup lessons must be used within 30 days.",
      },
    ],
    courseMode: ["Onsite"],
    image: "/elegant-grand-piano-in-warm-studio-lighting.jpg",
    imageAlt: "A grand piano in the warm lighting of the ABA Music Academy studio",
    published: true,
  },
  // Voice and violin programs are scaffolds. Flip `published: true` only once
  // the corresponding instructor is published in lib/teachers.ts and the copy
  // below has been reviewed — the content-honesty rule in design-system/MASTER.md
  // forbids "coming soon" landing pages that read as live offerings.
  {
    slug: "voice-lessons",
    subject: "Voice",
    navLabel: "Voice Lessons",
    metaTitle: `Voice Lessons in ${AREA}`,
    metaDescription: `Private singing lessons in the ${AREA} — healthy technique, breath support, range, and performance confidence for kids, teens, and adults.`,
    eyebrow: "Voice Program",
    title: `Voice Lessons in the ${AREA}`,
    lede: "Healthy technique, confidence, and expressive singing — voice lessons that support musicality from warmups to performance.",
    intro: [
      `ABA Music Academy offers private voice lessons for singers across the ${SITE.location.areaLong}. Lessons are one-on-one and tailored to the student's voice, age, and goals.`,
    ],
    sections: [
      {
        heading: "What you'll learn",
        body: ["Voice lessons build a reliable, healthy instrument first, then apply it to the songs you love."],
        bullets: [
          "Breath support, tone production, and range building",
          "Song interpretation across classical and contemporary styles",
          "Audition, recital, and stage confidence preparation",
        ],
      },
    ],
    faqs: [],
    courseMode: ["Onsite"],
    image: "/services/vocal.png",
    imageAlt: "Illustration of a singer at a microphone",
    published: false,
  },
  {
    slug: "violin-lessons",
    subject: "Violin",
    navLabel: "Violin Lessons",
    metaTitle: `Violin Lessons in ${AREA}`,
    metaDescription: `Private violin lessons in the ${AREA} — posture, bowing, intonation, and repertoire from Baroque to Romantic, rooted in conservatory tradition.`,
    eyebrow: "Violin Program",
    title: `Violin Lessons in the ${AREA}`,
    lede: "Expression, technique, and beautiful tone. Classical violin instruction rooted in the same conservatory tradition as our piano program.",
    intro: [
      `ABA Music Academy offers private violin lessons for students across the ${SITE.location.areaLong}. Lessons are one-on-one and tailored to the student's level and goals.`,
    ],
    sections: [
      {
        heading: "What you'll learn",
        body: ["Violin lessons build solid fundamentals and grow into repertoire and ensemble playing."],
        bullets: [
          "Posture, bowing, and intonation fundamentals",
          "Repertoire across Baroque, Classical, and Romantic periods",
          "Ensemble preparation and recital performance",
        ],
      },
    ],
    faqs: [],
    courseMode: ["Onsite"],
    image: "/services/violin.png",
    imageAlt: "Illustration of a violin",
    published: false,
  },
]

/** Programs that are ready to show publicly. */
export const publishedPrograms = programs.filter((program) => program.published)

export function getProgram(slug: string) {
  return publishedPrograms.find((program) => program.slug === slug)
}

/**
 * Site-wide FAQ (rendered at /faq with FAQPage schema). Answers are drawn from
 * the policies, lessons, and about pages — keep them in sync when policy copy
 * changes.
 */
export const siteFaqs: ProgramFaq[] = [
  {
    question: "Where is ABA Music Academy located?",
    answer: `We are a private music studio serving the ${SITE.location.areaLong}, including ${SITE.location.areaServed.slice(0, -1).join(", ")}, and ${SITE.location.areaServed.at(-1)}. Lessons are held in-studio; contact us for the exact location and directions.`,
  },
  {
    question: "What instruments do you teach?",
    answer:
      "Private piano lessons are open for enrollment now, for beginners through advanced students of all ages. Voice and violin instruction are being added as new faculty join the studio — send an inquiry and we'll match you with a teacher as soon as spots open.",
  },
  {
    question: "Do you offer a free trial lesson?",
    answer:
      "Yes. Every new student can book a free trial lesson before enrolling. You'll meet the teacher, play a little (or nothing at all if you're brand new), get an honest read on your current level, and talk through goals, lesson length, and a regular weekly time. There's no obligation to continue.",
  },
  {
    question: "How much do lessons cost?",
    answer:
      "Monthly tuition starts at $160 for one 30-minute lesson per week ($230 for 45 minutes, $300 for 60 minutes), with discounts for two or three lessons per week. There is a one-time $35 registration fee. See Lessons & Pricing for the full table.",
  },
  {
    question: "What ages do you teach?",
    answer:
      "Students of all ages. Young beginners are usually ready around age 5 or 6, once they can focus for a 30-minute lesson; we also teach school-age children, teens preparing for festivals or auditions, and adults who are starting fresh or returning to the piano after years away.",
  },
  {
    question: "Who will my teacher be?",
    answer:
      "Piano lessons are taught by our founder, Arpine, who holds a PhD in Music, has over 10 years of teaching experience, and is an MTAC member. Meet the full faculty on the Faculty page.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "Lessons cancelled with at least 24 hours' notice can be rescheduled at no charge, subject to availability. Late cancellations and no-shows are charged 30% of the lesson cost. Makeup lessons must be used within 30 days.",
  },
  {
    question: "How does payment work?",
    answer:
      "Monthly tuition is due by the end of the first week of each month and can be paid securely online by card through the student portal, or by cash or check. Payments more than 7 days late incur a 10% fee.",
  },
  {
    question: "What are your studio hours?",
    answer: `${SITE.hours.map((h) => `${h.label}: ${h.display}`).join("; ")}; ${SITE.closedDays.join(", ")}: closed.`,
  },
  {
    question: "Are there recitals or performance opportunities?",
    answer:
      "Yes. Students have optional studio recitals and performance events throughout the year, and performing is encouraged but never required. Advancing students can also prepare for MTAC festivals, Certificate of Merit evaluations, competitions, and school or conservatory auditions with their teacher.",
  },
  {
    question: "How do I get started?",
    answer:
      "Submit an inquiry with the student's age, experience, and preferred times, and we'll reach out to schedule a free trial lesson. After the trial, choose a lesson length and weekly time and enroll online.",
  },
]
