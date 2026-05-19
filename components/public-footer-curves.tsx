/** Decorative pink curve streaks for the public footer (from footer design v2). */
export function PublicFooterCurves({ intensity = 80 }: { intensity?: number }) {
  const o = intensity / 100
  const pink = {
    main: "#D14BA0",
    bright: "#DF65B2",
    glow: "rgba(209,75,160,0.08)",
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1200 340"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M-40,30 C200,120 400,-20 650,80 S1000,160 1260,60"
          fill="none"
          stroke={pink.main}
          strokeWidth="2.5"
          opacity={o * 0.35}
        />
        <path
          d="M-60,50 C180,140 420,0 680,95 S1020,175 1280,75"
          fill="none"
          stroke={pink.bright}
          strokeWidth="1"
          opacity={o * 0.2}
        />
        <path
          d="M-40,30 C200,120 400,-20 650,80 S1000,160 1260,60 L1260,120 C1000,220 650,140 400,40 200,180 -40,90 Z"
          fill={pink.glow}
          opacity={o * 0.6}
        />
        <path
          d="M1260,200 C1000,140 800,280 550,210 S200,130 -60,240"
          fill="none"
          stroke={pink.main}
          strokeWidth="2"
          opacity={o * 0.28}
        />
        <path
          d="M1280,218 C1020,155 830,298 570,225 S220,148 -40,258"
          fill="none"
          stroke={pink.bright}
          strokeWidth="0.8"
          opacity={o * 0.18}
        />
        <path
          d="M1260,200 C1000,140 800,280 550,210 S200,130 -60,240 L-60,290 C200,180 550,260 800,330 1000,190 1260,250 Z"
          fill={pink.glow}
          opacity={o * 0.5}
        />
        <circle cx="920" cy="70" r="2.5" fill={pink.main} opacity={o * 0.4} />
        <circle cx="940" cy="82" r="1.5" fill={pink.bright} opacity={o * 0.3} />
        <circle cx="905" cy="88" r="1.8" fill={pink.main} opacity={o * 0.25} />
        <circle cx="280" cy="220" r="2" fill={pink.main} opacity={o * 0.35} />
        <circle cx="300" cy="232" r="1.2" fill={pink.bright} opacity={o * 0.25} />
      </svg>
    </div>
  )
}
