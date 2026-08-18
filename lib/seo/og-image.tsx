import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { SITE } from "@/lib/site"

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

/**
 * Shared Open Graph / Twitter card renderer. Cream surface + terracotta accent
 * (public-site palette, see design-system/MASTER.md), Playfair Display for the
 * headline, brand mark top-left.
 */
export async function renderOgImage({
  headline,
  kicker = SITE.name,
  footer = `${SITE.location.areaLong} · ${SITE.url.replace(/^https?:\/\//, "")}`,
}: {
  headline: string
  kicker?: string
  footer?: string
}) {
  const [playfair, logo] = await Promise.all([
    readFile(join(process.cwd(), "lib/seo/fonts/PlayfairDisplay-Bold.ttf")),
    readFile(join(process.cwd(), "public", SITE.logo.replace(/^\//, ""))),
  ])
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #f5ebd9 0%, #efe0c6 100%)",
          color: "#2b2117",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Logo mark is light-on-transparent; sit it on the wood surface so it reads on cream. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 104,
              height: 104,
              borderRadius: 24,
              background: "#3b2a1e",
              boxShadow: "0 6px 18px rgba(43,33,23,0.18)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders raw <img> */}
            <img src={logoSrc} width={84} height={84} alt="" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>{kicker}</div>
            <div style={{ fontSize: 22, color: "#8a5a3c", letterSpacing: 4, textTransform: "uppercase" }}>
              {SITE.tagline}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Playfair Display",
            fontSize: headline.length > 40 ? 64 : 76,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -1,
            maxWidth: 1000,
          }}
        >
          {headline}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: "#5b4636",
          }}
        >
          <div style={{ display: "flex" }}>{footer}</div>
          <div
            style={{
              display: "flex",
              padding: "12px 28px",
              borderRadius: 999,
              background: "#a0522d",
              color: "#fff7ea",
              fontWeight: 600,
            }}
          >
            Free trial lesson
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Playfair Display", data: playfair, style: "normal", weight: 700 }],
    },
  )
}
