import type { Metadata } from "next"
import { Noto_Music } from "next/font/google"

// Authenticated / private surface — never index.
export const metadata: Metadata = { robots: { index: false, follow: false } }

const notoMusic = Noto_Music({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-noto-music",
  display: "swap",
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className={notoMusic.variable}>{children}</div>
}
