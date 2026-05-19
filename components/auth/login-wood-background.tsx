import Image from "next/image"
import { cn } from "@/lib/utils"

interface LoginWoodBackgroundProps {
  children: React.ReactNode
  className?: string
  showLogo?: boolean
  logoSubtitle?: string
}

export function LoginWoodBackground({
  children,
  className,
  showLogo = true,
  logoSubtitle = "Student & Teacher Portal",
}: LoginWoodBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-12",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(
              176deg,
              transparent, transparent 7px,
              rgba(0,0,0,0.06) 7px, rgba(0,0,0,0.06) 8px
            ),
            repeating-linear-gradient(
              172deg,
              transparent, transparent 30px,
              rgba(255,255,255,0.035) 30px, rgba(255,255,255,0.035) 32px
            ),
            linear-gradient(165deg, #6B5A48 0%, #5E4E3C 20%, #544636 45%, #5E4E3C 70%, #6B5A48 100%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_40%,rgba(0,0,0,0.15)_100%)]" />
      <div className="pointer-events-none absolute top-[20%] left-1/2 h-[350px] w-[500px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(201,169,110,0.07)_0%,transparent_65%)]" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        {showLogo ? (
          <div className="mb-10 text-center">
            <Image
              src="/aba-logo-cropped.png"
              alt="ABA Music Academy"
              width={280}
              height={100}
              className="mx-auto h-[100px] w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
              priority
            />
            {logoSubtitle ? (
              <p className="mt-2.5 text-[10.5px] font-semibold tracking-[0.3em] text-[rgba(201,169,110,0.7)] uppercase">
                {logoSubtitle}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}
