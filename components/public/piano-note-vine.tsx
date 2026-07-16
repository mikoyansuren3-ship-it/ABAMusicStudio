/**
 * Decorative "vine" of piano notes for the awards section.
 *
 * A stem climbs the full height of the strip with a fainter back-stem behind it
 * for depth; eighth notes, beamed pairs, quarter notes, note-head clusters,
 * spiral tendrils and leaves branch off it like foliage. Pure inline SVG (no
 * unicode music glyphs — see design-system/MASTER.md §5). Rendered in the
 * decorative pink shades (`--vine-pink-1..4`, echoing the logo pink) that the
 * design system sanctions for this element only (MASTER.md §1). Purely
 * decorative: aria-hidden, never intercepts pointer events. `side="right"`
 * mirrors the whole motif so the two vines frame the content symmetrically.
 *
 * Depth comes from mixing shades and opacity: deeper pinks at low opacity read
 * as background, lighter pinks pop to the front. The SVG uses a tall viewBox and
 * `preserveAspectRatio="xMidYMid slice"`, so it scales to cover whatever height
 * the section grows to.
 */

type Tone = "light" | "soft" | "mid" | "deep"

const PINK: Record<Tone, string> = {
  light: "var(--vine-pink-1)",
  soft: "var(--vine-pink-2)",
  mid: "var(--vine-pink-3)",
  deep: "var(--vine-pink-4)",
}

const color = (t: Tone) => PINK[t]

/** A single note head (filled ellipse, tilted like real notation). */
function NoteHead({ tone = "soft", o = 0.9 }: { tone?: Tone; o?: number }) {
  return <ellipse cx="0" cy="0" rx="8.4" ry="6.1" transform="rotate(-22)" fill={color(tone)} opacity={o} />
}

/** Graceful flag off the top of a stem (for eighth notes). */
function Flag({ tone = "soft", o = 0.9 }: { tone?: Tone; o?: number }) {
  return <path d="M0,0 C10,1 16,8 13,18 C15,9 10,4 0,5.5 Z" fill={color(tone)} opacity={o} />
}

/** Eighth note: head + stem + flag, anchored at the head. */
function EighthNote({ tone = "soft", o = 0.9 }: { tone?: Tone; o?: number }) {
  return (
    <g>
      <NoteHead tone={tone} o={o} />
      <line x1="7.5" y1="-3.4" x2="7.5" y2="-46" stroke={color(tone)} strokeWidth="2.3" strokeLinecap="round" opacity={o} />
      <g transform="translate(7.5 -46)">
        <Flag tone={tone} o={o} />
      </g>
    </g>
  )
}

/** Quarter note: head + plain stem. */
function QuarterNote({ tone = "soft", o = 0.9 }: { tone?: Tone; o?: number }) {
  return (
    <g>
      <NoteHead tone={tone} o={o} />
      <line x1="7.5" y1="-3.4" x2="7.5" y2="-43" stroke={color(tone)} strokeWidth="2.3" strokeLinecap="round" opacity={o} />
    </g>
  )
}

/** Beamed pair of eighth notes — two heads joined by a slanted beam. */
function BeamedPair({ tone = "soft", o = 0.9 }: { tone?: Tone; o?: number }) {
  return (
    <g>
      <NoteHead tone={tone} o={o} />
      <line x1="7.5" y1="-3.4" x2="7.5" y2="-41" stroke={color(tone)} strokeWidth="2.3" strokeLinecap="round" opacity={o} />
      <g transform="translate(25 6)">
        <NoteHead tone={tone} o={o} />
        <line x1="7.5" y1="-3.4" x2="7.5" y2="-47" stroke={color(tone)} strokeWidth="2.3" strokeLinecap="round" opacity={o} />
      </g>
      <line x1="7.5" y1="-44" x2="32.5" y2="-41" stroke={color(tone)} strokeWidth="4.6" strokeLinecap="round" opacity={o} />
    </g>
  )
}

/** A small cluster of note-head "berries" growing off the stem. */
function Cluster({ tone = "mid", o = 0.6 }: { tone?: Tone; o?: number }) {
  return (
    <g>
      <line x1="4" y1="0" x2="7" y2="-11" stroke={color(tone)} strokeWidth="1.3" strokeLinecap="round" opacity={o} />
      <line x1="12" y1="4" x2="15" y2="-6" stroke={color(tone)} strokeWidth="1.3" strokeLinecap="round" opacity={o} />
      <ellipse cx="2" cy="1" rx="4.4" ry="3.3" transform="rotate(-20 2 1)" fill={color(tone)} opacity={o} />
      <ellipse cx="10" cy="5" rx="4.4" ry="3.3" transform="rotate(-20 10 5)" fill={color(tone)} opacity={o} />
      <ellipse cx="5" cy="11" rx="4.2" ry="3.1" transform="rotate(-20 5 11)" fill={color(tone)} opacity={o * 0.92} />
    </g>
  )
}

/** Simple leaf, for organic filler between the notes. */
function Leaf({ tone = "mid", o = 0.5 }: { tone?: Tone; o?: number }) {
  return (
    <g opacity={o}>
      <path d="M0,0 C10,-9 22,-9 30,0 C22,9 10,9 0,0 Z" fill={color(tone)} />
      <path d="M2,0 H28" stroke="var(--wood-dark)" strokeWidth="0.8" opacity="0.35" />
    </g>
  )
}

/** A curling tendril — the signature flourish of a climbing vine. */
function Tendril({ o = 0.5 }: { o?: number }) {
  return (
    <path
      d="M0,0 C8,-6 17,-3 17,5 C17,12 9,14 6,8 C4,4 8,2 9,5.5"
      fill="none"
      stroke="var(--vine-pink-2)"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity={o}
    />
  )
}

/** A branch line from the stem out to a motif. */
function Branch({ d, o = 0.45 }: { d: string; o?: number }) {
  return <path d={d} fill="none" stroke="var(--vine-pink-3)" strokeWidth="1.5" strokeLinecap="round" opacity={o} />
}

export function PianoNoteVine({
  side = "left",
  className = "",
}: {
  side?: "left" | "right"
  className?: string
}) {
  const gid = `vineGrad-${side}`

  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${side === "left" ? "left-0" : "right-0"} ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 132 1200"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        style={side === "right" ? { transform: "scaleX(-1)" } : undefined}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--vine-pink-1)" />
            <stop offset="0.5" stopColor="var(--vine-pink-3)" />
            <stop offset="1" stopColor="var(--vine-pink-2)" />
          </linearGradient>
        </defs>

        {/* Fainter back-stem, offset for depth */}
        <path
          d="M60,-24 C94,108 40,196 74,312 C106,430 46,516 74,636 C104,756 46,846 74,966 C100,1080 50,1162 64,1240"
          fill="none"
          stroke="var(--vine-pink-3)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.22"
        />

        {/* Main stem: soft wide under-stroke + bright gradient over-stroke */}
        <path
          d="M70,-24 C42,96 100,182 68,300 C38,416 100,506 68,624 C38,744 100,834 68,954 C42,1070 96,1154 70,1240"
          fill="none"
          stroke="var(--vine-pink-2)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.16"
        />
        <path
          d="M70,-24 C42,96 100,182 68,300 C38,416 100,506 68,624 C38,744 100,834 68,954 C42,1070 96,1154 70,1240"
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.62"
        />

        {/* Foliage along the stem, alternating sides, mixed shades for depth */}
        <Branch d="M58,96 C40,108 30,126 27,148" />
        <g transform="translate(20 152) scale(1.06)">
          <EighthNote tone="light" o={0.92} />
        </g>

        <Branch d="M84,168 C100,178 106,196 106,214" o={0.4} />
        <g transform="translate(96 210) rotate(16)">
          <Tendril o={0.52} />
        </g>

        <Branch d="M60,232 C44,244 36,262 34,284" />
        <g transform="translate(24 290) scale(1.12)">
          <BeamedPair tone="soft" o={0.85} />
        </g>

        <Branch d="M86,320 C102,330 108,348 108,366" o={0.4} />
        <g transform="translate(96 356) rotate(20)">
          <Leaf tone="mid" o={0.42} />
        </g>

        <Branch d="M58,392 C42,404 34,420 33,440" />
        <g transform="translate(22 446) scale(0.92)">
          <Cluster tone="deep" o={0.6} />
        </g>

        <Branch d="M86,470 C102,480 108,498 108,516" o={0.42} />
        <g transform="translate(96 508) rotate(-8) scale(1.02)">
          <QuarterNote tone="light" o={0.88} />
        </g>

        <Branch d="M58,548 C42,560 34,578 33,600" />
        <g transform="translate(21 606) rotate(-6) scale(1.08)">
          <EighthNote tone="mid" o={0.82} />
        </g>

        <Branch d="M86,632 C102,642 108,660 108,678" o={0.4} />
        <g transform="translate(97 672) rotate(-18)">
          <Tendril o={0.48} />
        </g>

        <Branch d="M58,706 C42,718 34,736 33,758" />
        <g transform="translate(22 764) scale(1.1)">
          <BeamedPair tone="soft" o={0.85} />
        </g>

        <Branch d="M86,792 C102,802 108,820 108,838" o={0.4} />
        <g transform="translate(96 830) rotate(22)">
          <Leaf tone="deep" o={0.4} />
        </g>

        <Branch d="M58,862 C42,874 34,892 33,914" />
        <g transform="translate(22 920) scale(0.9)">
          <Cluster tone="mid" o={0.58} />
        </g>

        <Branch d="M86,946 C102,956 108,974 108,992" o={0.42} />
        <g transform="translate(95 984) rotate(-6) scale(1.02)">
          <EighthNote tone="light" o={0.84} />
        </g>

        <Branch d="M58,1020 C42,1032 34,1050 33,1072" />
        <g transform="translate(23 1078) rotate(-4)">
          <QuarterNote tone="mid" o={0.74} />
        </g>

        <Branch d="M84,1104 C100,1114 105,1130 105,1148" o={0.4} />
        <g transform="translate(94 1140) rotate(14)">
          <Tendril o={0.42} />
        </g>
      </svg>
    </div>
  )
}
