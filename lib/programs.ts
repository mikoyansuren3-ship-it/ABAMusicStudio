import { SITE } from "@/lib/site"

/**
 * Keyword landing pages ("programs") for each instrument, rendered at
 * /programs/[slug]. Mirrors the `published` gate in lib/teachers.ts: a program
 * only goes live (route + sitemap + nav) once it has real content and a
 * published instructor. Unpublished programs 404.
 *
 * The four pages share one "Programme Notes" template (an editorial broadsheet
 * on parchment: typographic masthead, drop-cap lede, an instrument rail down
 * the left of the body, and a dark wood credentials band). Everything that
 * varies between instruments is data in this file — see
 * `design-system/pages/programs.md` for the design contract.
 */

export type ProgramFaq = { question: string; answer: string }

/** Which instrument graphic runs down the left of the body sections. */
export type ProgramRail = "violin" | "piano" | "voice" | "qanun"

/**
 * One fact stack in the masthead's right gutter. An array value renders one
 * line per entry (the studio's two opening-hour ranges).
 */
export type ProgramFact = { label: string; value: string | string[] }

/**
 * A card in a `cards` block. `marker` is the display glyph in the corner — the
 * violin page uses its open string letters (G, D, A) so the cards read as a
 * scale. Omit it and the card renders without one.
 */
export type ProgramCard = { marker?: string; title: string; body: string }

export type ProgramBlock =
  /** Plain paragraphs. `columns: 2` sets them as newspaper columns. */
  | { kind: "prose"; paragraphs: string[]; columns?: 1 | 2 }
  /** Intro paragraph(s) followed by a row of titled cards. */
  | { kind: "cards"; paragraphs?: string[]; cards: ProgramCard[] }
  /** Intro paragraph(s) followed by a 01/02/03 numbered list. */
  | { kind: "numbered"; paragraphs?: string[]; items: string[] }
  /** Teacher bios, pulled from lib/teachers.ts by slug. */
  | { kind: "teachers"; teachers: string[] }
  /** Captioned recital photos. */
  | { kind: "gallery"; photos: Array<{ src: string; alt: string; caption: string }> }
  /** Renders `program.faqs` in two columns. */
  | { kind: "faqs" }

export type ProgramSection = {
  /**
   * NOTE: `programTeaches()` below finds the curriculum section by
   * `heading.toLowerCase().includes("learn")` to populate schema.org
   * `Course.teaches`. Renaming "What you'll learn" silently empties that
   * structured data.
   */
  heading: string
  block: ProgramBlock
}

/** One distinction inside a credentials-band column. */
export type CredentialEntry = {
  title: string
  detail?: string
  /** Rendered as gold note-head bullets (masterclass artists, countries). */
  bullets?: string[]
}

export type ProgramCredentials = {
  title: string
  intro: string
  /** Four figures in the 2x2 tally beside the band heading. */
  tally: Array<{ figure: string; label: string }>
  /** Four grouped columns. */
  groups: Array<{ label: string; entries: CredentialEntry[] }>
  /** Italic pull-quote in the closing row above the CTA. */
  quote: string
}

/** The bordered plate beside the lede. */
export type ProgramPlate = {
  image?: string
  imageAlt?: string
  /**
   * Illustrations sit on the parchment with `object-contain` and no sepia; a
   * photograph is cropped to fill and gets the shared photo treatment.
   */
  illustration?: boolean
  note: string
}

export type Program = {
  /** URL segment under /programs, e.g. "piano-lessons" */
  slug: string
  /** Instrument / subject label matching `Teacher.subjects` (e.g. "Piano"). */
  subject: string
  /** Short label used in nav and breadcrumbs. */
  navLabel: string
  /** Issue number in the masthead rule row, e.g. "01". */
  issue: string
  /** <title> (template appends "| ABA Music Academy"). Keep ≤ 60 chars. */
  metaTitle: string
  /** Meta description, ≤ 155 chars. */
  metaDescription: string
  /** Visible H1. */
  title: string
  /** Playfair-italic tagline under the H1. */
  lede: string
  /** Right-gutter fact stacks. Exactly three. */
  facts: ProgramFact[]
  /** Lede paragraphs, set in two newspaper columns behind a drop cap. */
  intro: string[]
  plate: ProgramPlate
  rail: ProgramRail
  sections: ProgramSection[]
  credentials: ProgramCredentials
  /** "How to get started" — one line per numbered step. */
  steps: string[]
  faqs: ProgramFaq[]
  /** schema.org courseMode values */
  courseMode: Array<"Onsite" | "Online">
  /**
   * Representative image for schema.org / social cards. Not rendered on the
   * page itself — the masthead is typographic.
   */
  image?: string
  imageAlt?: string
  published?: boolean
}

/**
 * schema.org `Course.teaches`, read by lib/seo/schema.ts. Pulls the list items
 * out of whichever block the "What you'll learn" section uses, so the
 * structured data survives a section switching between cards and a numbered
 * list.
 */
export function programTeaches(program: Program): string[] | undefined {
  const section = program.sections.find((s) => s.heading.toLowerCase().includes("learn"))
  if (!section) return undefined
  const { block } = section
  if (block.kind === "numbered") return block.items
  if (block.kind === "cards") return block.cards.map((card) => card.title)
  return undefined
}

const AREA = SITE.location.area

/** "Santa Clarita, Valencia, …, and Castaic" — the lede's catchment sentence. */
const AREA_SERVED = `${SITE.location.areaServed.slice(0, -1).join(", ")}, and ${SITE.location.areaServed.at(-1)}`

/** "Monday - Friday" -> "Mon–Fri", "Saturday" -> "Sat". */
const shortDays = (label: string) =>
  label
    .split(" - ")
    .map((day) => day.slice(0, 3))
    .join("\u2013")

/**
 * "1:00 PM - 9:00 PM" -> "1:00\u20139:00 PM"; a range that crosses noon keeps both
 * meridiems ("10:00 AM\u20132:00 PM").
 */
const shortRange = (display: string) => {
  const [open, close] = display.split(" - ")
  const meridiem = close?.slice(-2)
  const compactOpen = open?.endsWith(meridiem ?? "") ? open.slice(0, -3) : open
  return `${compactOpen}\u2013${close}`
}

/** One compact line per opening-hours range, for the masthead's third fact. */
const STUDIO_HOURS = SITE.hours.map((h) => `${shortDays(h.label)} ${shortRange(h.display)}`)

export const programs: Program[] = [
  {
    slug: "piano-lessons",
    subject: "Piano",
    navLabel: "Piano Lessons",
    issue: "01",
    rail: "piano",
    metaTitle: `Piano Lessons in ${AREA}`,
    metaDescription: `Private piano lessons in the ${AREA} for kids, teens, and adults. Conservatory-trained, MTAC-member instruction, free trial lesson, flexible 30/45-minute formats.`,
    title: "Piano Lessons",
    lede: "Private, one-on-one piano instruction for beginners through advanced students — taught with patience, classical rigor, and a curriculum built around each student.",
    facts: [
      { label: "Instrument", value: "Piano" },
      { label: "Format", value: "Private, 30 or 45 min" },
      { label: "Studio hours", value: STUDIO_HOURS },
    ],
    intro: [
      `ABA Music Academy offers private piano lessons for students across the ${SITE.location.areaLong} — from Valencia and Newhall to Saugus, Canyon Country, and Stevenson Ranch. Every lesson is one-on-one, so beginners build correct habits from the first note and advancing students get focused coaching on repertoire, technique, and performance.`,
      "Lessons are led by our founder, Arpine, who holds a PhD in Music, brings more than 10 years of teaching experience, and is an active member of the Music Teachers' Association of California (MTAC).",
      "There is no minimum experience. The first lesson is used to assess your level and set goals together — and it is free.",
    ],
    plate: {
      image: "/students/summer-2025-piano-lesson.jpg",
      imageAlt: "An ABA Music Academy student at the grand piano during a summer lesson",
      note: "No experience needed. The first lesson is free.",
    },
    sections: [
      {
        heading: "Who piano lessons are for",
        block: {
          kind: "cards",
          paragraphs: [
            "We teach young beginners, school-age children, teens preparing for auditions or festivals, and adults returning to the piano or starting for the first time. There is no minimum experience — the first lesson is used to assess your level and set goals together.",
          ],
          cards: [
            { title: "Young beginners, ages 5+", body: "Building reading, rhythm, and hand position." },
            { title: "Kids and teens", body: "Working through method books, repertoire, and theory." },
            {
              title: "Festival & audition students",
              body: "Preparing for MTAC festivals, Certificate of Merit, competitions, or auditions.",
            },
            { title: "Adults, new and returning", body: "A structured, patient path back to the instrument." },
          ],
        },
      },
      {
        heading: "What you'll learn",
        block: {
          kind: "numbered",
          paragraphs: [
            "Our approach blends classical training with what each student actually wants to play. Alongside repertoire, lessons cover the fundamentals that make independent musicianship possible.",
          ],
          items: [
            "Technique: posture, hand shape, tone, scales, and arpeggios",
            "Note reading, rhythm, and sight-reading",
            "Music theory and ear training woven into repertoire",
            "Expression, phrasing, and musical interpretation",
            "Memorization and performance preparation for recitals",
          ],
        },
      },
      {
        heading: "Lesson lengths & tuition",
        block: {
          kind: "cards",
          paragraphs: [
            "Choose 30- or 45-minute weekly lessons, once or twice per week, at a regular weekly time. Tuition depends on lesson length and weekly frequency — send an inquiry and we'll share current rates and available times. A one-time registration fee applies at enrollment.",
          ],
          cards: [
            {
              title: "30 minutes",
              body: "Once or twice weekly. The usual starting point for young beginners.",
            },
            {
              title: "45 minutes",
              body: "Once or twice weekly. Room for repertoire, theory, and performance prep.",
            },
            {
              title: "Billing",
              body: "Monthly tuition by card, cash, or check through the student portal, plus a one-time registration fee.",
            },
          ],
        },
      },
      {
        heading: "Your piano teachers",
        block: { kind: "teachers", teachers: ["arpine", "valeria-boroda"] },
      },
      {
        heading: "On stage",
        block: {
          kind: "gallery",
          photos: [
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
        },
      },
      { heading: "Common questions", block: { kind: "faqs" } },
    ],
    credentials: {
      title: "Training, Membership & Experience",
      intro:
        "What our piano faculty brings to every lesson — the degrees, the professional memberships, and the years at the keys behind the teaching.",
      tally: [
        { figure: "PhD", label: "In Music (founder)" },
        { figure: "20+", label: "Combined years teaching" },
        { figure: "2", label: "Professional memberships" },
        { figure: "2", label: "Piano instructors" },
      ],
      groups: [
        {
          label: "Training",
          entries: [
            { title: "PhD in Music", detail: "Arpine, founder & piano instructor" },
            { title: "Higher music education", detail: "Valeria Boroda, piano instructor" },
          ],
        },
        {
          label: "Classical foundation",
          entries: [
            { title: "Komitas State Conservatory", detail: "Armenia — part of Arpine's classical training" },
            { title: "Aram Khachaturian Museum", detail: "Yerevan, Armenia" },
          ],
        },
        {
          label: "Memberships",
          entries: [
            { title: "MTAC member", detail: "Music Teachers' Association of California" },
            { title: "International musicians' association", detail: "Valeria Boroda" },
          ],
        },
        {
          label: "Recognition",
          entries: [
            {
              title: "Award-winning pianist",
              detail: "Valeria Boroda",
              bullets: ["MTAC festivals", "Certificate of Merit", "Competitions & auditions"],
            },
          ],
        },
      ],
      quote:
        "Students preparing for MTAC festivals, Certificate of Merit evaluations, competitions, or conservatory auditions work toward them with teachers who have sat on that side of the stage.",
    },
    steps: [
      "Submit an inquiry with the student's age, experience, and preferred times.",
      "Book a free trial lesson.",
      "Choose a lesson plan and a weekly time slot.",
      "Enroll online — monthly tuition by card, cash, or check.",
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
    published: true,
  },
  {
    slug: "voice-lessons",
    subject: "Voice",
    navLabel: "Voice Lessons",
    issue: "02",
    rail: "voice",
    metaTitle: `Voice Lessons in ${AREA}`,
    metaDescription: `Private singing lessons in the ${AREA} — healthy technique, breath support, range, and performance confidence for kids, teens, and adults.`,
    title: "Voice Lessons",
    lede: "Healthy technique, confidence, and expressive singing — voice lessons that support musicality from warmups to performance.",
    facts: [
      { label: "Discipline", value: "Voice" },
      { label: "Format", value: "Private, weekly" },
      { label: "Studio hours", value: STUDIO_HOURS },
    ],
    intro: [
      `ABA Music Academy offers private voice lessons for singers across the ${SITE.location.areaLong}. Lessons are one-on-one and tailored to the student's voice, age, and goals.`,
      "Voice lessons are taught by Marietta Galstyan, a singer with an extensive international background who has earned top prizes at competitions and festivals across Europe, and who loves working with kids.",
      `Families come to the studio from ${AREA_SERVED}. There is no minimum experience, and the first lesson is free.`,
    ],
    plate: {
      image: "/programs/vocal-illustration.png",
      imageAlt: "Illustration of a vintage studio microphone",
      illustration: true,
      note: "No experience needed. The first lesson is free.",
    },
    sections: [
      {
        heading: "What you'll learn",
        block: {
          kind: "cards",
          paragraphs: [
            "Voice lessons build a reliable, healthy instrument first, then apply it to the songs you love.",
          ],
          cards: [
            {
              title: "Breath, tone & range",
              body: "Breath support, tone production, and range building — the foundation every other skill rests on.",
            },
            {
              title: "Song interpretation",
              body: "Working across classical and contemporary styles, shaping phrasing and meaning.",
            },
            {
              title: "Stage confidence",
              body: "Audition, recital, and stage confidence preparation, at whatever pace suits the singer.",
            },
          ],
        },
      },
      {
        heading: "Your voice teacher",
        block: { kind: "teachers", teachers: ["marietta-galstyan"] },
      },
    ],
    credentials: {
      title: "Training, Prizes & Stage Experience",
      intro:
        "What Marietta brings to every voice lesson — the training, the competition record, and the years of performing behind the teaching.",
      tally: [
        { figure: "4", label: "Countries performed in" },
        { figure: "Top", label: "Prizes across competitions" },
        { figure: "Multi", label: "Genre versatility" },
        { figure: "Kids", label: "A specialty she loves" },
      ],
      groups: [
        {
          label: "Training",
          entries: [
            {
              title: "Music school graduate",
              detail: "Raised in a deeply musical environment, singing and playing piano from early childhood",
            },
          ],
        },
        {
          label: "Competitions",
          entries: [
            {
              title: "Top prizes",
              detail: "International competitions and festivals across Europe, consistently",
              bullets: ["Hungary", "Italy", "France", "Bulgaria"],
            },
          ],
        },
        {
          label: "Stage experience",
          entries: [
            { title: "International concerts", detail: "Performing from a young age" },
            { title: "Charity events", detail: "Concerts supporting children" },
          ],
        },
        {
          label: "Recognition",
          entries: [
            {
              title: "Praised for",
              detail: "Emotional depth, vocal precision, and stage presence — and for versatility across genres",
            },
          ],
        },
      ],
      quote:
        "Singers preparing for auditions, recitals, or their first time on a stage work toward it with a teacher who has done it in four countries.",
    },
    steps: [
      "Send an inquiry with the singer's age, experience, and preferred times.",
      "Book a free trial lesson and meet Marietta.",
      "Choose a weekly time and enroll online through the student portal.",
    ],
    faqs: [],
    courseMode: ["Onsite"],
    image: "/teachers/marietta-galstyan.jpg",
    imageAlt: "Marietta Galstyan, voice teacher at ABA Music Academy, singing on stage",
    published: true,
  },
  {
    slug: "violin-lessons",
    subject: "Violin",
    navLabel: "Violin Lessons",
    issue: "03",
    rail: "violin",
    metaTitle: `Violin Lessons in ${AREA}`,
    metaDescription: `Private violin lessons in the ${AREA} — posture, bowing, intonation, and repertoire from Baroque to Romantic, rooted in conservatory tradition.`,
    title: "Violin Lessons",
    lede: "Expression, technique, and beautiful tone — classical violin instruction rooted in the same conservatory tradition as our piano program.",
    facts: [
      { label: "Instrument", value: "Violin" },
      { label: "Format", value: "Private, weekly" },
      { label: "Studio hours", value: STUDIO_HOURS },
    ],
    intro: [
      `ABA Music Academy offers private violin lessons for students across the ${SITE.location.areaLong}. Lessons are one-on-one and tailored to the student's level and goals — beginners build correct habits from the first note, and advancing students get focused coaching on repertoire, technique, and performance.`,
      "Violin lessons are taught by Asya Anisimova, an award-winning violinist trained at the Tchaikovsky Specialized Music School in Yerevan who has performed as a soloist with the Armenian State Symphony Orchestra.",
      `Families come to the studio from ${AREA_SERVED}. Studio hours are ${SITE.hours.map((h) => `${h.label} ${h.display}`).join(" and ")}.`,
      "There is no minimum experience. The first lesson is used to assess the student's level, size the instrument, and set goals together — and it is free.",
    ],
    plate: {
      image: "/programs/violin-student.png",
      imageAlt: "Illustration of a young student carrying a violin and bow",
      illustration: true,
      note: "No experience needed. The first lesson is free.",
    },
    sections: [
      {
        heading: "What you'll learn",
        block: {
          kind: "cards",
          paragraphs: ["Violin lessons build solid fundamentals and grow into repertoire and ensemble playing."],
          cards: [
            {
              marker: "G",
              title: "Posture, bowing, intonation",
              body: "The fundamentals come first: how the instrument sits, how the bow travels, and how the ear corrects the hand.",
            },
            {
              marker: "D",
              title: "Baroque to Romantic repertoire",
              body: "Repertoire across the Baroque, Classical, and Romantic periods, chosen to stretch technique and taste at once.",
            },
            {
              marker: "A",
              title: "Ensemble & recital preparation",
              body: "Playing with others is a separate skill. Lessons build toward ensemble work and studio recitals.",
            },
          ],
        },
      },
      {
        // CONTENT GAP: the design's three practice tiers (10-15 min for ages
        // 5-7, and so on) were a designer's draft — the studio has no stated
        // practice-minutes policy, so they are deliberately not published here
        // (MASTER.md §9). Add them as a `cards` block once the owner confirms
        // real numbers.
        heading: "Practice between lessons",
        block: {
          kind: "prose",
          paragraphs: [
            "Progress on the violin comes from short, consistent practice — not one long session before the lesson. Your teacher writes the week's plan down in the lesson, so families know exactly what a finished day looks like.",
          ],
        },
      },
      {
        heading: "Your violin teacher",
        block: { kind: "teachers", teachers: ["asya-anisimova"] },
      },
    ],
    credentials: {
      title: "Training, Awards & Stage Experience",
      intro:
        "What Asya brings to every violin lesson — the conservatory training, competition results, and stage experience behind the teaching. Every line below is a checkable distinction, not a description.",
      tally: [
        { figure: "3", label: "First prizes & Grand Prix" },
        { figure: "3", label: "Orchestras performed with" },
        { figure: "3", label: "Masterclass artists" },
        { figure: "1", label: "Conservatory diploma, honours" },
      ],
      groups: [
        {
          label: "Training",
          entries: [
            {
              title: "Graduated with Excellence",
              detail: "Tchaikovsky Specialized Music School, Yerevan — studio of Prof. Eduard Tadevosyan",
            },
          ],
        },
        {
          label: "Competitions",
          entries: [
            { title: "Grand Prix", detail: "AGBU Discover Talents Competition" },
            { title: "First Prize", detail: "Charleston International Music Competition" },
            { title: "First Prize", detail: "World Open Music Competition" },
          ],
        },
        {
          label: "Stage experience",
          entries: [
            { title: "Soloist", detail: "Armenian State Symphony Orchestra" },
            { title: "Soloist", detail: "Sofia State Chamber Orchestra" },
            { title: "First Violin", detail: "Chapman University Orchestra" },
          ],
        },
        {
          label: "Masterclasses",
          entries: [
            { title: "Studied under", bullets: ["Daniel Hope", "Stella Chen", "Sergey Khachatryan"] },
          ],
        },
      ],
      quote:
        "Students preparing for festivals, Certificate of Merit evaluations, competitions, or conservatory auditions work toward them with a teacher who has sat on that side of the stage.",
    },
    steps: [
      "Send an inquiry with age, experience, and preferred times.",
      "Book a free trial lesson and meet Asya.",
      "Get sized for the right instrument, 1/8 through full size.",
      "Choose a weekly time and enroll online through the portal.",
    ],
    faqs: [],
    courseMode: ["Onsite"],
    image: "/programs/violin-hero.jpg",
    imageAlt: "Asya Anisimova, ABA Music Academy violin instructor, holding her violin outside the studio",
    published: true,
  },
  {
    slug: "qanun-lessons",
    subject: "Qanun",
    navLabel: "Qanun Lessons",
    issue: "04",
    rail: "qanun",
    metaTitle: `Qanun Lessons in ${AREA}`,
    metaDescription: `Private qanun lessons in the ${AREA} — learn the traditional Armenian zither with an instructor who has 25+ years of teaching and performing experience.`,
    title: "Qanun Lessons",
    lede: "Learn the qanun — the shimmering plucked zither at the heart of Armenian traditional music — with a teacher who has spent 25+ years performing and passing it on.",
    facts: [
      { label: "Instrument", value: "Qanun" },
      { label: "Format", value: "Private, weekly" },
      { label: "Studio hours", value: STUDIO_HOURS },
    ],
    intro: [
      `ABA Music Academy offers private qanun lessons for students across the ${SITE.location.areaLong}. The qanun is a traditional Armenian plucked string instrument with a bright, harp-like voice, played flat on the lap with plectra on both hands.`,
      "Qanun lessons are taught by Gohar Harutunyan, who holds a music education degree, brings more than 25 years of experience as a qanun teacher and performer, and specializes in working with children.",
      `Families come to the studio from ${AREA_SERVED}. No experience is needed, and the first lesson is free.`,
    ],
    // CONTENT GAP: no qanun photography exists (docs/content/photo-usage.md).
    // The design's plate held a drag-and-drop placeholder, which is a
    // prototyping affordance and must not ship — the plate runs caption-only
    // until a real instrument photo exists.
    plate: { note: "No experience needed. The first lesson is free." },
    sections: [
      {
        heading: "About the instrument",
        block: {
          kind: "prose",
          columns: 2,
          paragraphs: [
            "The qanun is a traditional Armenian plucked string instrument with a bright, harp-like voice. It sits flat on the lap and is played with plectra worn on both hands, giving it a shimmering, cascading sound unlike anything else in the studio.",
            "Students who learn it join a living tradition — the repertoire is Armenian folk and classical music, and lessons connect technique to the culture the instrument comes from.",
          ],
        },
      },
      {
        heading: "What you'll learn",
        block: {
          kind: "numbered",
          paragraphs: [
            "Lessons build technique and repertoire side by side, connecting students to Armenian musical heritage while developing well-rounded musicianship.",
          ],
          items: [
            "Posture, hand position, and plectrum technique",
            "Traditional Armenian melodies and folk repertoire",
            "Note reading, rhythm, and ear training on the instrument",
            "Performance preparation for recitals and cultural events",
          ],
        },
      },
      {
        heading: "Your qanun teacher",
        block: { kind: "teachers", teachers: ["gohar-harutunyan"] },
      },
    ],
    credentials: {
      title: "Training, Teaching & Cultural Work",
      intro:
        "What Gohar brings to every qanun lesson — the degree, the decades of teaching, and the community performance behind the instruction.",
      tally: [
        { figure: "25+", label: "Years teaching & performing" },
        { figure: "5", label: "Years in the U.S." },
        { figure: "1", label: "Music education degree" },
        { figure: "Kids", label: "A declared specialty" },
      ],
      groups: [
        {
          label: "Training",
          entries: [{ title: "Music education degree", detail: "Gohar Harutunyan, qanun instructor" }],
        },
        {
          label: "Teaching",
          entries: [
            { title: "25+ years", detail: "As a qanun teacher and performer" },
            { title: "Specialty with children", detail: "Where she does her best work" },
          ],
        },
        {
          label: "Performance",
          entries: [{ title: "Community performance", detail: "Five years actively performing in the U.S." }],
        },
        {
          label: "Cultural work",
          entries: [
            {
              title: "Armenian heritage",
              detail: "Sharing her love of music and Armenian culture through teaching and performance",
            },
          ],
        },
      ],
      quote:
        "For Armenian families, the qanun is a way to keep something. For everyone else, it is the most beautiful instrument in the studio you have never heard.",
    },
    steps: [
      "Send an inquiry with the student's age, experience, and preferred times.",
      "Book a free trial lesson and try the qanun — no instrument needed to start.",
      "Choose a weekly time and enroll online through the student portal.",
    ],
    faqs: [],
    courseMode: ["Onsite"],
    image: "/teachers/gohar-harutunyan.jpg",
    imageAlt: "Gohar Harutunyan, qanun teacher at ABA Music Academy, with her qanun",
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
