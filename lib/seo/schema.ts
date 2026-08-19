import { SITE, SITE_DEFINITION, absoluteUrl } from "@/lib/site"
import { publishedTeachers, type Teacher } from "@/lib/teachers"
import type { Program, ProgramFaq } from "@/lib/programs"

/**
 * schema.org JSON-LD builders. Every builder returns a plain object; render
 * with <JsonLd data={...} /> from components/seo/json-ld.tsx.
 *
 * Stable @id values let Google merge the graph across pages:
 *   #organization  — the MusicSchool / LocalBusiness node
 *   #website       — the WebSite node
 *   /faculty#<slug> — each teacher
 */

export const ORG_ID = `${SITE.url}/#organization`
export const WEBSITE_ID = `${SITE.url}/#website`

type JsonLdObject = Record<string, unknown>

function compact<T extends JsonLdObject>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)) as T
}

function postalAddress() {
  const { streetAddress, postalCode, addressLocality, addressRegion, addressCountry } = SITE.location
  return compact({
    "@type": "PostalAddress",
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry,
  })
}

function openingHours() {
  return SITE.hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  }))
}

export function personSchema(teacher: Teacher, { minimal = false } = {}): JsonLdObject {
  const base = compact({
    "@type": "Person",
    "@id": `${SITE.url}/faculty#${teacher.slug}`,
    name: teacher.name,
    jobTitle: teacher.role,
    image: absoluteUrl(teacher.image),
    worksFor: { "@id": ORG_ID },
  })
  if (minimal) return base
  return compact({
    ...base,
    description: teacher.bio,
    knowsAbout: teacher.subjects,
    url: absoluteUrl("/faculty"),
    ...(teacher.slug === SITE.founder.slug
      ? {
          alumniOf: [
            { "@type": "CollegeOrUniversity", name: "Komitas State Conservatory" },
          ],
          memberOf: {
            "@type": "Organization",
            name: "Music Teachers' Association of California",
            alternateName: "MTAC",
          },
        }
      : {}),
  })
}

/** MusicSchool (a LocalBusiness) — emitted on every public page. */
export function organizationSchema(): JsonLdObject {
  const founder = publishedTeachers.find((t) => t.slug === SITE.founder.slug)
  return compact({
    "@context": "https://schema.org",
    "@type": ["MusicSchool", "LocalBusiness"],
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    slogan: SITE.tagline,
    description: SITE_DEFINITION,
    url: SITE.url,
    logo: absoluteUrl(SITE.logo),
    image: [absoluteUrl(SITE.heroImage), absoluteUrl(SITE.logo)],
    telephone: SITE.phoneE164,
    email: SITE.email,
    address: postalAddress(),
    areaServed: SITE.location.areaServed.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: openingHours(),
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Credit Card, Cash, Check",
    sameAs: [SITE.instagram.url],
    founder: founder ? personSchema(founder, { minimal: true }) : undefined,
    knowsAbout: [
      "Piano lessons",
      "Voice lessons",
      "Violin lessons",
      "Qanun lessons",
      "Music education",
      "Classical piano",
      "Music theory",
    ],
  })
}

export function websiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.name,
    url: SITE.url,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  }
}

export type Crumb = { name: string; href: string }

export function breadcrumbSchema(crumbs: Crumb[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.href),
    })),
  }
}

export function faqSchema(faqs: ProgramFaq[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}

/** Course + Service pair for a program landing page. */
export function programSchema(program: Program): JsonLdObject[] {
  const url = absoluteUrl(`/programs/${program.slug}`)
  const instructors = publishedTeachers.filter((t) => t.subjects.includes(program.subject))
  const course = compact({
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    name: program.title,
    description: program.metaDescription,
    url,
    image: absoluteUrl(program.image),
    provider: { "@id": ORG_ID },
    educationalLevel: "Beginner to Advanced",
    teaches: program.sections.find((s) => s.heading.toLowerCase().includes("learn"))?.bullets,
    availableLanguage: "en",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: program.courseMode,
      courseSchedule: {
        "@type": "Schedule",
        repeatFrequency: "P1W",
        scheduleTimezone: SITE.timezone,
      },
      instructor: instructors.map((t) => personSchema(t, { minimal: true })),
      location: {
        "@type": "Place",
        name: `${SITE.name} studio`,
        address: postalAddress(),
      },
    },
  })
  const service = compact({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    serviceType: `${program.subject} lessons`,
    name: program.title,
    description: program.lede,
    url,
    provider: { "@id": ORG_ID },
    areaServed: SITE.location.areaServed.map((name) => ({ "@type": "City", name })),
    audience: { "@type": "Audience", audienceType: "Children, teens, and adults" },
  })
  return [course, service]
}

export function personListSchema(teachers: Teacher[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE.name} faculty`,
    itemListElement: teachers.map((teacher, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: personSchema(teacher),
    })),
  }
}
