import type { Metadata } from "next"

/**
 * Metadata for a public marketing page.
 *
 * Why a helper: Next merges `openGraph` / `twitter` per-object, not per-field,
 * so a page that sets `openGraph.url` silently drops the root layout's OG image
 * and Twitter card type. This spells the whole object out every time.
 *
 * `path` is the canonical path ("/about"). `image` defaults to the site-wide
 * /opengraph-image; segments with their own opengraph-image.tsx should pass
 * `image: null` so Next injects the segment file instead.
 */
export function publicPageMetadata({
  title,
  description,
  path,
  image = "/opengraph-image",
  robots,
}: {
  title: string
  description: string
  path: string
  image?: string | null
  robots?: Metadata["robots"]
}): Metadata {
  const images = image ? [{ url: image, width: 1200, height: 630 }] : undefined
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    ...(robots ? { robots } : {}),
  }
}
