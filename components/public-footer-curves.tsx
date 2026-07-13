/**
 * Decorative flowing staff lines for the public footer.
 * Five parallel curves (a musical staff) in brand gold, plus a few note dots.
 */
export function PublicFooterCurves({ intensity = 80 }: { intensity?: number }) {
  const o = intensity / 100
  const staffOffsets = [0, 13, 26, 39, 52]

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1200 340"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {staffOffsets.map((dy, i) => (
          <path
            key={dy}
            d={`M-40,${46 + dy} C280,${18 + dy} 640,${74 + dy} 1240,${34 + dy}`}
            fill="none"
            stroke="var(--gold)"
            strokeWidth={i === 2 ? 1.4 : 1}
            opacity={o * (i === 2 ? 0.22 : 0.14)}
          />
        ))}
        <ellipse cx="330" cy="52" rx="7" ry="5" transform="rotate(-18 330 52)" fill="var(--gold)" opacity={o * 0.28} />
        <ellipse cx="720" cy="92" rx="6" ry="4.5" transform="rotate(-18 720 92)" fill="var(--gold)" opacity={o * 0.22} />
        <ellipse cx="1020" cy="58" rx="5" ry="4" transform="rotate(-18 1020 58)" fill="var(--gold)" opacity={o * 0.18} />
      </svg>
    </div>
  )
}
