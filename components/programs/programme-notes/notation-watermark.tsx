import styles from "./programme-notes.module.css"

/**
 * The music-notation watermark behind every parchment band on the program
 * pages. One 320x300 tile repeats across `<main>`; the note geometry is lifted
 * from `components/public/piano-note-vine.tsx` so the watermark and the awards
 * page's note vine speak the same visual language.
 *
 * Two things matter and are easy to lose in an edit:
 *
 *  1. Every stem and flag sits fully inside the tile. The motifs are inset from
 *     all four edges on purpose — a note whose flag crosses x=320 clips at the
 *     seam and the repeat reads as a broken grid.
 *  2. Each motif carries its own opacity (0.05–0.085) under a 0.74 group
 *     opacity, so the field has depth instead of reading as flat wallpaper.
 *
 * No five-line staff fragments: at this scale they render as grey boxes.
 */
export function NotationWatermark({ id }: { id: string }) {
  const patternId = `notation-${id}`

  return (
    <svg className={styles.watermark} aria-hidden focusable="false">
      <defs>
        <pattern id={patternId} width="320" height="300" patternUnits="userSpaceOnUse">
          <g fill="#3b2518" stroke="#3b2518" opacity="0.74">
            {/* 1 — beamed eighth pair, upper left */}
            <g opacity="0.08">
              <ellipse cx="38" cy="72" rx="9.5" ry="7" transform="rotate(-20 38 72)" />
              <ellipse cx="82" cy="62" rx="9.5" ry="7" transform="rotate(-20 82 62)" />
              <rect x="45.5" y="26" width="3" height="46" />
              <rect x="89.5" y="16" width="3" height="46" />
              <path d="M45.5 26 L92.5 16 L92.5 24 L45.5 34 Z" strokeWidth="0" />
            </g>

            {/* 2 — single eighth with flag, upper right */}
            <g opacity="0.065">
              <ellipse cx="238" cy="54" rx="9" ry="6.6" transform="rotate(-20 238 54)" />
              <rect x="245" y="10" width="2.8" height="44" />
              <path
                d="M247.8 12 C260 20, 262 32, 254 43 C258 30, 254 22, 247.8 19 Z"
                strokeWidth="0"
              />
            </g>

            {/* 3 — quarter note, upper far right */}
            <g opacity="0.05">
              <ellipse cx="296" cy="104" rx="8.6" ry="6.4" transform="rotate(-20 296 104)" />
              <rect x="302.6" y="62" width="2.8" height="42" />
            </g>

            {/* 4 — three-note cluster, centre left */}
            <g opacity="0.075">
              <ellipse cx="24" cy="176" rx="8.4" ry="6.2" transform="rotate(-20 24 176)" />
              <rect x="30.4" y="136" width="2.6" height="40" />
              <ellipse cx="60" cy="188" rx="8.4" ry="6.2" transform="rotate(-20 60 188)" />
              <rect x="66.4" y="148" width="2.6" height="40" />
              <ellipse cx="96" cy="170" rx="8.4" ry="6.2" transform="rotate(-20 96 170)" />
              <rect x="102.4" y="130" width="2.6" height="40" />
            </g>

            {/* 5 — hollow half note, centre */}
            <g opacity="0.06">
              <ellipse
                cx="170"
                cy="150"
                rx="9.8"
                ry="7.2"
                transform="rotate(-20 170 150)"
                fill="none"
                strokeWidth="2.6"
              />
              <rect x="177.5" y="106" width="2.8" height="44" />
            </g>

            {/* 6 — single eighth with flag, centre right */}
            <g opacity="0.085">
              <ellipse cx="252" cy="182" rx="9" ry="6.6" transform="rotate(-20 252 182)" />
              <rect x="259" y="138" width="2.8" height="44" />
              <path
                d="M261.8 140 C274 148, 276 160, 268 171 C272 158, 268 150, 261.8 147 Z"
                strokeWidth="0"
              />
            </g>

            {/* 7 — beamed eighth pair, lower left */}
            <g opacity="0.07">
              <ellipse cx="48" cy="272" rx="9.5" ry="7" transform="rotate(-20 48 272)" />
              <ellipse cx="92" cy="264" rx="9.5" ry="7" transform="rotate(-20 92 264)" />
              <rect x="55.5" y="226" width="3" height="46" />
              <rect x="99.5" y="218" width="3" height="46" />
              <path d="M55.5 226 L102.5 218 L102.5 226 L55.5 234 Z" strokeWidth="0" />
            </g>

            {/* 8 — quarter note, lower centre */}
            <g opacity="0.055">
              <ellipse cx="164" cy="262" rx="8.6" ry="6.4" transform="rotate(-20 164 262)" />
              <rect x="170.6" y="220" width="2.8" height="42" />
            </g>

            {/* 9 — single eighth with flag, lower right */}
            <g opacity="0.06">
              <ellipse cx="256" cy="286" rx="8.8" ry="6.5" transform="rotate(-20 256 286)" />
              <rect x="262.8" y="246" width="2.6" height="40" />
              <path
                d="M265.4 248 C276 255, 278 265, 271 275 C274 264, 271 257, 265.4 254 Z"
                strokeWidth="0"
              />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
