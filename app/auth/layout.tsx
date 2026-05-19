import { Noto_Music } from "next/font/google"

const notoMusic = Noto_Music({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-noto-music",
  display: "swap",
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className={notoMusic.variable}>{children}</div>
}
