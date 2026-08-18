import type { MetadataRoute } from "next"

import { SITE } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "ABA Music",
    description: `Private piano lessons in the ${SITE.location.areaLong}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#f5ebd9",
    theme_color: "#f5ebd9",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/aba-music-academy-logo.png", sizes: "500x500", type: "image/png", purpose: "any" },
    ],
  }
}
