import type { MetadataRoute } from "next"

import { hasRealAwards } from "@/lib/awards"
import { publishedPrograms } from "@/lib/programs"
import { absoluteUrl } from "@/lib/site"

/**
 * Bump when public copy changes meaningfully; used as `lastModified` for the
 * static marketing routes so crawlers don't see a fresh date on every build.
 */
const CONTENT_UPDATED = new Date("2026-08-17")

type Entry = {
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
}

const STATIC_ROUTES: Entry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/lessons", priority: 0.9, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faculty", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/inquire", priority: 0.7, changeFrequency: "yearly" },
  { path: "/services", priority: 0.6, changeFrequency: "monthly" },
  { path: "/policies", priority: 0.4, changeFrequency: "yearly" },
  // /privacy is intentionally omitted while the policy is a noindexed draft.
  ...(hasRealAwards ? [{ path: "/awards", priority: 0.6, changeFrequency: "monthly" } as Entry] : []),
]

export default function sitemap(): MetadataRoute.Sitemap {
  const programEntries: Entry[] = publishedPrograms.map((program) => ({
    path: `/programs/${program.slug}`,
    priority: 0.9,
    changeFrequency: "monthly",
  }))

  return [...STATIC_ROUTES, ...programEntries].map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: CONTENT_UPDATED,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }))
}
