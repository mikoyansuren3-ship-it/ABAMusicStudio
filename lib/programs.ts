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
  /** Optional recital-photo strip rendered after the content sections. */
  gallery?: Array<{ src: string; alt: string; caption: string }>
  published?: boolean
}

const AREA = SITE.location.area

export const programs: Program[] = [
  {
    slug: "piano-lessons",
    subject: "Piano",
    navLabel: "Piano Lessons",
    metaTitle: `Piano Lessons in ${AREA}`,
    metaDescription: `Private piano lessons in the ${AREA} for kids, teens, and adults. Conservatory-trained, MTAC-member instruction, free trial lesson, flexible 30/45-minute formats.`,
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
        heading: "Lesson lengths",
        body: [
          "Choose 30- or 45-minute weekly lessons, once or twice per week, at a regular weekly time. Tuition depends on lesson length and weekly frequency — send an inquiry and we'll share current rates and available times. A one-time registration fee applies at enrollment.",
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
          "Tuition depends on the lesson length (30 or 45 minutes) and how many lessons per week you choose, and is billed monthly. There is also a one-time registration fee at enrollment. Send an inquiry and we'll share current rates along with available lesson times.",
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
    image: "/students/summer-2025-piano-lesson.jpg",
    imageAlt: "An ABA Music Academy student at the grand piano during a summer lesson",
    gallery: [
      {
        src: "/students/recital-june-2026-first-recital.jpg",
        alt: "A young beginner on stage at ABA Music Academy's 2026 end-of-year concert",
        caption: "Young beginners take the stage from their first year",
      },
      {
        src: "/students/recital-june-2026-student-performing.jpg",
        alt: "A school-age student performing at the grand piano at the June 2026 concert",
        caption: "School-age students perform at every June concert",
      },
      {
        src: "/students/recital-june-2026-teen-performing.jpg",
        alt: "A teen student performing at the grand piano at the June 2026 concert",
        caption: "Teens prepare recital, festival, and audition repertoire",
      },
    ],
    published: true,
  },
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
      "Voice lessons are taught by Marietta Galstyan, a singer with an extensive international background who has earned top prizes at competitions and festivals across Europe, and who loves working with kids.",
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
      {
        heading: "How to get started",
        body: [
          "Start with a free trial lesson. You'll meet your teacher, sing a little (or nothing at all, if you're brand new), and talk through goals and scheduling. Send an inquiry with the student's age and experience, and we'll match you with a regular weekly time.",
        ],
      },
    ],
    faqs: [],
    courseMode: ["Onsite"],
    image: "/services/vocal.png",
    imageAlt: "Illustration of a singer at a microphone",
    published: true,
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
      "Violin lessons are taught by Asya Anisimova, an award-winning violinist trained at the Tchaikovsky Specialized Music School in Yerevan who has performed as a soloist with the Armenian State Symphony Orchestra.",
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
      {
        heading: "How to get started",
        body: [
          "Start with a free trial lesson. You'll meet your teacher, play a little (or nothing at all, if you're brand new), and talk through goals, instrument sizing, and scheduling. Send an inquiry with the student's age and experience, and we'll match you with a regular weekly time.",
        ],
      },
    ],
    faqs: [],
    courseMode: ["Onsite"],
    image: "/services/violin.png",
    imageAlt: "Illustration of a violin",
    published: true,
  },
  {
    slug: "qanun-lessons",
    subject: "Qanun",
    navLabel: "Qanun Lessons",
    metaTitle: `Qanun Lessons in ${AREA}`,
    metaDescription: `Private qanun lessons in the ${AREA} — learn the traditional Armenian zither with an instructor who has 25+ years of teaching and performing experience.`,
    eyebrow: "Qanun Program",
    title: `Qanun Lessons in the ${AREA}`,
    lede: "Learn the qanun — the shimmering plucked zither at the heart of Armenian traditional music — with a teacher who has spent 25+ years performing and passing it on.",
    intro: [
      `ABA Music Academy offers private qanun lessons for students across the ${SITE.location.areaLong}. The qanun is a traditional Armenian plucked string instrument with a bright, harp-like voice, played flat on the lap with plectra on both hands.`,
      "Qanun lessons are taught by Gohar Harutunyan, who holds a music education degree, brings more than 25 years of experience as a qanun teacher and performer, and specializes in working with children.",
    ],
    sections: [
      {
        heading: "What you'll learn",
        body: [
          "Lessons build technique and repertoire side by side, connecting students to Armenian musical heritage while developing well-rounded musicianship.",
        ],
        bullets: [
          "Posture, hand position, and plectrum technique",
          "Traditional Armenian melodies and folk repertoire",
          "Note reading, rhythm, and ear training on the instrument",
          "Performance preparation for recitals and cultural events",
        ],
      },
      {
        heading: "How to get started",
        body: [
          "Start with a free trial lesson. You'll meet your teacher, try the instrument, and talk through goals and scheduling. Send an inquiry with the student's age and experience, and we'll match you with a regular weekly time.",
        ],
      },
    ],
    faqs: [],
    courseMode: ["Onsite"],
    image: "/teachers/gohar-harutunyan.jpg",
    imageAlt: "Gohar Harutunyan, ABA Music Academy qanun instructor, with her qanun",
    published: true,
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
      "Private lessons are open for enrollment in piano, voice, violin, and qanun — the traditional Armenian zither — for beginners through advanced students of all ages. Guitar, chess, and math enrichment are on the way; send an inquiry and we'll match you with a teacher as soon as spots open.",
  },
  {
    question: "Do you offer a free trial lesson?",
    answer:
      "Yes. Every new student can book a free trial lesson before enrolling. You'll meet the teacher, play a little (or nothing at all if you're brand new), get an honest read on your current level, and talk through goals, lesson length, and a regular weekly time. There's no obligation to continue.",
  },
  {
    question: "How much do lessons cost?",
    answer:
      "Tuition depends on the lesson length (30 or 45 minutes) and how many lessons per week you choose, and is billed monthly. There is also a one-time registration fee at enrollment. Send an inquiry and we'll share current rates along with available lesson times.",
  },
  {
    question: "What ages do you teach?",
    answer:
      "Students of all ages. Young beginners are usually ready around age 5 or 6, once they can focus for a 30-minute lesson; we also teach school-age children, teens preparing for festivals or auditions, and adults who are starting fresh or returning to the piano after years away.",
  },
  {
    question: "Who will my teacher be?",
    answer:
      "Piano lessons are led by our founder, Arpine, who holds a PhD in Music, has over 10 years of teaching experience, and is an MTAC member, alongside award-winning pianist Valeria Boroda. Voice is taught by Marietta Galstyan, violin by Asya Anisimova, and qanun by Gohar Harutunyan. Meet everyone on the Our Teachers page.",
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
