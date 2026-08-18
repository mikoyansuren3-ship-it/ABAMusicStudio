import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og-image"
import { getProgram, publishedPrograms } from "@/lib/programs"
import { SITE } from "@/lib/site"

export const alt = `${SITE.name} program`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return publishedPrograms.map((program) => ({ slug: program.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = getProgram(slug)
  return renderOgImage({ headline: program?.title ?? `Music Lessons in the ${SITE.location.area}` })
}
