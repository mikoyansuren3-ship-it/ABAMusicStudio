import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ConsentManager } from "@/components/consent/consent-manager"
import { Toaster } from "sonner"
import { SITE } from "@/lib/site"
import "./globals.css"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const inter = Inter({ subsets: ["latin"] })

const DEFAULT_TITLE = `${SITE.name} | Music Lessons in ${SITE.location.area}`
const DEFAULT_DESCRIPTION = `Private music lessons in the ${SITE.location.areaLong} — piano, voice, violin, and qanun — for kids, teens, and adults. Free trial lesson and flexible scheduling.`

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE.name}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE.name,
  keywords: [
    "music lessons Santa Clarita",
    "piano lessons",
    `piano lessons ${SITE.location.addressLocality}`,
    `piano teacher ${SITE.location.area}`,
    "piano lessons Valencia CA",
    "voice lessons Santa Clarita",
    "violin lessons Santa Clarita",
    "qanun lessons",
    "kids piano lessons",
    "adult piano lessons",
    "music school",
  ],
  category: "education",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    url: "/",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Cream surface token (see --cream in app/globals.css).
  themeColor: "#f5ebd9",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.className} font-sans antialiased`}>
        {children}
        <Toaster richColors />
        {/* Consent banner, preferences dialog, and every consent-gated tag. */}
        <ConsentManager />
        <SpeedInsights />
      </body>
    </html>
  )
}
