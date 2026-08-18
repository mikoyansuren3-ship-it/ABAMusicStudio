/**
 * Single source of truth for public business facts (NAP: name / address /
 * phone), brand strings, and the canonical site URL. Every public surface —
 * header, footer, contact page, metadata, and schema.org JSON-LD — reads from
 * here so search engines see one consistent identity.
 *
 * Keep this in sync with the Google Business Profile once it exists.
 */

const FALLBACK_URL = "https://abamusicacademy.org"

function resolveSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!raw || raw.startsWith("http://localhost")) return FALLBACK_URL
  return raw.replace(/\/$/, "")
}

export type OpeningHours = {
  /** schema.org day names */
  days: Array<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday">
  /** 24h "HH:MM" */
  opens: string
  closes: string
  /** Human label for the UI, e.g. "Monday - Friday" */
  label: string
  /** Human time range for the UI, e.g. "1:00 PM - 9:00 PM" */
  display: string
}

export const SITE = {
  name: "ABA Music Academy",
  legalName: "ABA Music Academy",
  tagline: "Where talent meets tradition",
  /** Canonical origin, no trailing slash. */
  url: resolveSiteUrl(),
  email: "arpine@abamusicacademy.org",
  phone: "818-836-2322",
  phoneE164: "+18188362322",
  instagram: {
    handle: "@aba_music_academy",
    url: "https://www.instagram.com/aba_music_academy",
  },
  /** Square brand mark, path under /public. */
  logo: "/aba-music-academy-logo.png",
  /** Wide brand image for OG / schema `image`. */
  heroImage: "/elegant-grand-piano-in-warm-studio-lighting.jpg",
  timezone: "America/Los_Angeles",
  location: {
    /** Short label used in titles and copy. */
    area: "Santa Clarita Valley",
    /** Longer label used in descriptions. */
    areaLong: "Santa Clarita Valley, California",
    addressLocality: "Santa Clarita",
    addressRegion: "CA",
    addressCountry: "US",
    /**
     * Not published (service-area business). Fill in when the owner wants the
     * street address public — schema output picks it up automatically.
     */
    streetAddress: undefined as string | undefined,
    postalCode: undefined as string | undefined,
    /** Neighborhoods / cities served — drives schema `areaServed` and copy. */
    areaServed: [
      "Santa Clarita",
      "Valencia",
      "Newhall",
      "Saugus",
      "Canyon Country",
      "Stevenson Ranch",
      "Castaic",
    ],
  },
  hours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "13:00",
      closes: "21:00",
      label: "Monday - Friday",
      display: "1:00 PM - 9:00 PM",
    },
    {
      days: ["Saturday"],
      opens: "10:00",
      closes: "14:00",
      label: "Saturday",
      display: "10:00 AM - 2:00 PM",
    },
  ] satisfies OpeningHours[],
  /** Days with no hours entry are closed; listed for the UI. */
  closedDays: ["Sunday"] as const,
  founder: {
    name: "Arpine",
    slug: "arpine",
    jobTitle: "Founder & Piano Instructor",
  },
} as const

/**
 * One-sentence plain-language definition of the business. Used verbatim near
 * the top of the homepage and About page and as the schema.org `description`
 * — the sentence search/AI engines lift when describing the entity.
 */
export const SITE_DEFINITION = `${SITE.name} is a private piano studio in the ${SITE.location.areaLong}, offering one-on-one piano lessons for kids, teens, and adults — from first notes to advanced repertoire — taught by a PhD-trained, MTAC-member founder.`

/** Absolute URL for a site path ("/about" → "https://…/about"). */
export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE.url}/`).toString()
}
