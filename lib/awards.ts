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
  /** Optional link to the competition / issuing body. Opens in a new tab. */
  href?: string
  /**
   * Only published awards render on the public site. Keep scaffolds
   * unpublished (mirrors the `publishedTeachers` gate in lib/teachers.ts).
   */
  published?: boolean
}

// NOTE: These are layout scaffolds so the awards section can be designed and
// reviewed before the real images arrive. Each entry with no `image` renders a
// decorative placeholder frame at the exact size a real award will fill. When
// the images are ready: set `image` + `imageAlt`, fill in `issuer`/`year`,
// flip `published: true`, and (optionally) link `/awards` from the nav.
//
// The grid reflows for any number of awards — add or remove entries freely.
export const awards: Award[] = [
  {
    id: "award-1",
    title: "Award Title",
    issuer: "Issuing Organization",
    year: "Year",
    published: true,
  },
  {
    id: "award-2",
    title: "Award Title",
    issuer: "Issuing Organization",
    year: "Year",
    published: true,
  },
  {
    id: "award-3",
    title: "Award Title",
    issuer: "Issuing Organization",
    year: "Year",
    published: true,
  },
  {
    id: "award-4",
    title: "Award Title",
    issuer: "Issuing Organization",
    year: "Year",
    published: true,
  },
  {
    id: "award-5",
    title: "Award Title",
    issuer: "Issuing Organization",
    year: "Year",
    published: true,
  },
  {
    id: "award-6",
    title: "Award Title",
    issuer: "Issuing Organization",
    year: "Year",
    published: true,
  },
]

export const publishedAwards = awards.filter((award) => award.published)
