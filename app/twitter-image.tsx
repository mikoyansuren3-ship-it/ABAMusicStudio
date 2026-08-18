import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og-image"
import { SITE } from "@/lib/site"

export const alt = `${SITE.name} — Piano Lessons in ${SITE.location.area}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgImage({ headline: `Piano Lessons in the ${SITE.location.area}` })
}
