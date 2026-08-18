# SEO — how it works and what the owner still needs to do

_Last updated 2026-08-17._

## What the site does today

| Concern | Where | Notes |
|---|---|---|
| Business facts (NAP, hours, area served, socials) | `lib/site.ts` | **Single source of truth.** Header, footer, contact page, metadata, and JSON-LD all read from `SITE`. Update here → everywhere. |
| Site-wide `<title>` template, description, OG/Twitter defaults, robots, manifest, GSC verification | `app/layout.tsx` | `title.template = "%s \| ABA Music Academy"`; pages set only their own title. |
| Per-page metadata (title, description, canonical, OG, Twitter) | `lib/seo/metadata.ts` → `publicPageMetadata()` | Use this in every public page. Next.js merges `openGraph`/`twitter` per-object, so a bare `openGraph: { url }` on a page silently drops the OG image — the helper spells the whole object out. |
| Structured data (schema.org JSON-LD) | `lib/seo/schema.ts` + `components/seo/json-ld.tsx` | `MusicSchool`/`LocalBusiness` + `WebSite` on every public page (`app/(public)/layout.tsx`); `Person` list on `/faculty`; `Course` + `Service` + `FAQPage` on program pages; `FAQPage` on `/faq`; `BreadcrumbList` via `components/seo/breadcrumbs.tsx`. |
| Landing pages | `lib/programs.ts` → `app/(public)/programs/[slug]` | Data-driven. `published: true` gates the route, sitemap, and nav. Voice/violin are scaffolds — publish only when an instructor is published in `lib/teachers.ts` (content-honesty rule, `design-system/MASTER.md §9`). |
| FAQ | `lib/programs.ts` → `siteFaqs` → `/faq` | Answers mirror `/policies` and `/lessons` copy — update both when policy changes. |
| Sitemap / robots / manifest | `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` | `/awards` is auto-excluded + `noindex` while `lib/awards.ts` only has placeholder entries (`hasRealAwards`). `/privacy` stays `noindex` until counsel-approved. Admin/portal/auth/enroll are disallowed + `noindex`. |
| Open Graph images | `lib/seo/og-image.tsx`, `app/opengraph-image.tsx`, `app/(public)/programs/[slug]/opengraph-image.tsx` | Rendered at build with `ImageResponse`; Playfair Display is vendored in `lib/seo/fonts/`. |
| Image optimization | `next.config.mjs` | `images.unoptimized` removed → AVIF/WebP + responsive `srcset` via `/_next/image`. Supabase avatars allowed via `remotePatterns`. |
| Analytics | `app/layout.tsx` | `@vercel/analytics` + `@vercel/speed-insights` (cookieless; no consent change needed). Enable both in the Vercel project → Analytics / Speed Insights tabs. Locally their scripts 404 — expected. |
| Crawl-file fast path | `proxy.ts` | Sitemap, robots, manifest, and OG images skip the Supabase session proxy. |

## Adding / editing content

- **New program page:** add an entry to `lib/programs.ts` with real copy and `published: true`; add its instructor to `lib/teachers.ts` (published). The route, sitemap entry, OG image, and schema are generated. Add a nav/footer link in `components/public-header.tsx` / `components/public-footer.tsx` if it deserves one.
- **New FAQ:** append to `siteFaqs` (site-wide) or `program.faqs` (per program).
- **Publishing the street address:** set `SITE.location.streetAddress` / `postalCode` in `lib/site.ts`. Schema output picks it up; the contact page location block still says "private studio" — edit that copy if you want the street shown.
- **Search Console verification:** set `GOOGLE_SITE_VERIFICATION` (the `content` value from the HTML-tag method) in Vercel → Environment Variables → Production, redeploy.

## Owner checklist (things code can't do)

1. **Vercel env:** confirm `NEXT_PUBLIC_SITE_URL=https://abamusicacademy.org` in Production (Stripe return URLs already depend on it; canonicals/sitemap now do too).
2. **Google Business Profile** — the single biggest local-search lever.
   - Create at business.google.com as a **service-area business** (hide address, set service area to Santa Clarita, Valencia, Newhall, Saugus, Canyon Country, Stevenson Ranch, Castaic).
   - Primary category **Music school**; secondary **Piano instructor**, **Music instructor**.
   - Name/phone/hours must match `lib/site.ts` exactly: `ABA Music Academy`, `818-836-2322`, Mon–Fri 1–9 PM, Sat 10 AM–2 PM.
   - Website `https://abamusicacademy.org`, appointment link `https://abamusicacademy.org/inquire`, add the Instagram link, upload the logo + studio/piano photos.
   - Add "Piano lessons" as a service with the starting price ($160/mo).
   - Once live, add the GBP URL to `SITE` `sameAs` (in `lib/seo/schema.ts` → `organizationSchema`).
3. **Google Search Console** — add property `abamusicacademy.org` (Domain property via DNS TXT, or URL-prefix via the HTML tag → `GOOGLE_SITE_VERIFICATION`). Then: submit `https://abamusicacademy.org/sitemap.xml`; use *URL Inspection → Request indexing* for `/`, `/programs/piano-lessons`, `/lessons`, `/faq`.
4. **Bing Webmaster Tools** — import from Search Console (one click), submit the same sitemap.
5. **Rich results check** — paste `https://abamusicacademy.org/programs/piano-lessons` and `/faq` into https://search.google.com/test/rich-results after deploy; fix anything flagged.
6. **Reviews** — after GBP is live, ask current families for Google reviews (the GBP "share review form" link). Reviews are the #1 local ranking factor after proximity.
7. **Citations** — make sure the website URL is on the MTAC member directory, Yelp, Nextdoor, Facebook page (if any), and any Santa Clarita parent/community directories, using the exact same NAP.
8. **Real content when ready** — replace the placeholder awards in `lib/awards.ts` (page auto-becomes indexable), publish voice/violin instructors + programs, and consider adding a few student-recital photos with descriptive alt text.
9. **Vercel dashboard** — turn on Web Analytics and Speed Insights for the project.

## Verifying locally

```bash
npm run lint && npm run qc:design && npm run build && npm run start -- -p 3100
```

Then check `http://localhost:3100/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`, and view-source on `/`, `/programs/piano-lessons`, `/faq` for `<link rel="canonical">`, `og:image`, and the `application/ld+json` blocks.
