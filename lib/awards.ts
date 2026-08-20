export type Award = {
  /** URL-safe id, also used as the React key */
  id: string
  /** Award name, e.g. "First Place — Junior Division" */
  title: string
  /** Who gave it, e.g. "MTAC Sonata Festival" */
  issuer?: string
  /** Year or span, e.g. "2024" */
  year?: string
  /**
   * The award image (certificate, medal, trophy photo). Path under /public.
   * Leave undefined to render a decorative placeholder frame — the layout
   * previews with the same footprint an image will occupy, so nothing shifts
   * when the real asset drops in.
   */
  image?: string
  /** Required whenever `image` is set. Describes the certificate/photo. */
  imageAlt?: string
  /**
   * "contain" (default) mats the image inside a landscape frame — right for
   * certificate/medal scans. "cover" fills a portrait frame edge to edge —
   * right for photos of award moments.
   */
  imageFit?: "cover" | "contain"
  /** Optional link to the competition / issuing body. Opens in a new tab. */
  href?: string
  /**
   * Only published awards render on the public site. Keep scaffolds
   * unpublished (mirrors the `publishedTeachers` gate in lib/teachers.ts).
   */
  published?: boolean
}

// Award moments photographed at studio events. Captions name the moment and
// the event — never the student (see docs/content/photo-usage.md: media
// releases + no names next to faces; the certificate photo ships with the
// printed student name blurred into the exported asset).
export const awards: Award[] = [
  {
    id: "cohen-festival-winners",
    title: "Festival Award Winners",
    issuer: "Liana & Ruben Cohen International Music Festival",
    image: "/students/cohen-festival-winners.jpg",
    imageAlt:
      "Three ABA Music Academy students on stage with their certificates and trophy at the Liana & Ruben Cohen International Music Festival",
    imageFit: "cover",
    href: "https://lianacohen.org/",
    published: true,
  },
  {
    id: "certificate-of-completion-2026",
    title: "Certificate of Completion",
    issuer: "End-of-Year Concert",
    year: "2026",
    image: "/students/recital-june-2026-certificate.jpg",
    imageAlt:
      "A student honored with roses and a certificate of completion at ABA Music Academy's 2026 end-of-year concert",
    imageFit: "cover",
    published: true,
  },
  {
    id: "recital-trophy-young-student",
    title: "Recital Trophy",
    issuer: "Christmas Recital",
    image: "/students/recital-trophy-young-student.jpg",
    imageAlt: "A young student holding her recital trophy beside her teacher at the Christmas recital",
    imageFit: "cover",
    published: true,
  },
  {
    id: "recital-students-honored",
    title: "Students Honored at the Finale",
    issuer: "Christmas Recital",
    image: "/students/recital-students-honored.jpg",
    imageAlt: "Two students celebrating with their teacher after the recital finale",
    imageFit: "cover",
    published: true,
  },
]

export const publishedAwards = awards.filter((award) => award.published)

/** Placeholder marker used by layout scaffold entries (none currently live). */
const PLACEHOLDER_TITLE = "Award Title"

/**
 * True once at least one published award is real (not a layout scaffold).
 * Drives whether /awards is indexable and listed in the sitemap — search
 * engines shouldn't see a page of "Award Title / Issuing Organization".
 */
export const hasRealAwards = publishedAwards.some((award) => award.title !== PLACEHOLDER_TITLE)

export type Recognition = {
  /** Competition / festival / testing-program name. */
  name: string
  /** One-line context shown under the name. */
  note: string
  /** Official program website. Opens in a new tab. */
  href: string
}

/**
 * Competitions and festivals ABA students prepare for and earn honors in.
 * Names only — individual results are added to `awards` above as they are
 * documented (photo or scan + student release).
 */
export const competitions: Recognition[] = [
  {
    name: "Liana & Ruben Cohen International Music Festival",
    note: "International competition and festival honoring young classical musicians, with the winners' concert held at the Colburn School in Los Angeles",
    href: "https://lianacohen.org/",
  },
  {
    name: "Charleston International Music Competition",
    note: "International competition for young musicians across instruments and age divisions",
    href: "https://charlestoncompetition.com/",
  },
  {
    name: "IAPMT International Competition",
    note: "Competitions of the International Association of Professional Music Teachers, open to all ages across four difficulty levels",
    href: "https://iapmt.org/",
  },
  {
    name: "MTAC Romantic Festival",
    note: "Branch festival of the Music Teachers' Association of California for Romantic and Impressionist repertoire — Chopin, Schumann, Brahms, Debussy, and their contemporaries",
    href: "https://www.mtac.org/",
  },
  {
    name: "MTAC Bach Festival",
    note: "Branch festival of the Music Teachers' Association of California dedicated to the music of J.S. Bach",
    href: "https://www.mtac.org/",
  },
  {
    name: "MTAC Contemporary Music Festival",
    note: "Branch festival of the Music Teachers' Association of California for 20th- and 21st-century repertoire",
    href: "https://www.mtac.org/",
  },
]

/**
 * Graded testing and certification programs our students test through.
 */
export const testingPrograms: Recognition[] = [
  {
    name: "MTAC Certificate of Merit",
    note: "California's statewide evaluation program in performance, technique, ear training, sight reading, and music theory",
    href: "https://www.mtac.org/programs/cm/",
  },
  {
    name: "Royal Conservatory of Music (RCM)",
    note: "Graded examinations of The Royal Conservatory's internationally recognized Certificate Program",
    href: "https://www.rcmusic.com/",
  },
  {
    name: "ABRSM",
    note: "Graded music exams of the Associated Board of the Royal Schools of Music",
    href: "https://www.abrsm.org/",
  },
  {
    name: "Piano Guild Auditions",
    note: "Annual National Piano Playing Auditions of the American College of Musicians / National Guild of Piano Teachers",
    href: "https://acmglobal.org/",
  },
]
