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
      style={
        {
          // Stage-light wood tones, intentionally lighter than the global --wood-* scale.
          "--wood-light": "#6B5A48",
          "--wood-light-mid": "#5E4E3C",
          "--wood-light-deep": "#544636",
        } as React.CSSProperties
      }
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
            linear-gradient(165deg, var(--wood-light) 0%, var(--wood-light-mid) 20%, var(--wood-light-deep) 45%, var(--wood-light-mid) 70%, var(--wood-light) 100%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_40%,rgba(0,0,0,0.15)_100%)]" />
      <div className="pointer-events-none absolute top-[20%] left-1/2 h-[350px] w-[500px] -translate-x-1/2 bg-[radial-gradient(ellipse,color-mix(in_srgb,var(--gold)_7%,transparent)_0%,transparent_65%)]" />

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
              <p className="mt-2.5 text-xs font-semibold tracking-[0.3em] text-gold/95 uppercase">
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
