# programs — `/programs/[slug]`

The four Music Programs pages (piano, voice, violin, qanun) share one template,
**Programme Notes**: an editorial broadsheet on parchment with a music-notation
watermark, a scroll-driven instrument rail down the left of the body, and a dark
wood credentials band. Implemented 2026-08-25 from the owner's design handoff.

All four pages are data in `lib/programs.ts`; the components live in
`components/programs/programme-notes/`.

## Motion tier

These pages use **MASTER §7b (cinematic)** — 760ms entrances, 44px travel,
`clip-path` bow-stroke and wipe reveals, a focus-pull blur, and a scroll-linked
rail marker. §7 was amended for this (owner decision, 2026-08-25); the pages are
the only surface currently granted the tier.

## Deviations from MASTER

- **§3 Typography.** The broadsheet runs its own scale, not the site scale.
  H1 is `clamp(48px, 6.2vw, 84px)` at weight 900 (MASTER caps page h1 at
  `text-4xl md:text-5xl`); section h2 is 40px/800 (MASTER says `text-3xl`).
  Eyebrows track at `.2–.24em` rather than `.18em`. The masthead H1 is
  deliberately the largest type on the site — it is the page's whole hierarchy.
- **§4 Layout.** The content column is a bespoke `max-width: 1180px` with 24px
  padding rather than `container mx-auto px-4`, and section rhythm is the
  design's 74px / 88–96px rather than `py-16 md:py-24`. The header and footer
  still use the site container, so the page chrome stays aligned with every
  other page.
- **§4 Radius.** Plates, image frames, cards, and the credentials tiles are
  square (radius 0). The editorial look depends on it. Buttons keep
  `rounded-md`; the band's CTA keeps `rounded-full`.
- **§5 Decoration.** The notation watermark, the four instrument rails, and the
  gold note-head bullets are inline SVG and CSS gradients, all `aria-hidden` and
  pointer-events-none, per §5. No new icon set; the old credentials-band lucide
  icons are gone.

Raw hex for the wood band, the rails, and the note-heads lives in
`programme-notes.module.css` — the chrome layer §2 already carves out. No raw
hex entered TSX, so no `scripts/design-qc.mjs` allowlist entry was needed.

## Photo treatment

Every photograph on these pages carries `filter: sepia(.18) contrast(1.02)` so
mixed sources (phone recital shots, studio portraits) sit together on the
parchment. Illustrations are exempt — they are recolored to the paper already.
See `docs/content/photo-usage.md`.

## Responsive decisions

The handoff was desktop-only (1280px design width); mobile was explicitly out of
scope. These are implementation calls, made 2026-08-25, not designed:

| Breakpoint | Decision |
| --- | --- |
| ≤ 1024px | The 120px instrument rail is **removed**, not shrunk — there is no room for it beside a readable measure, and a sliver of fingerboard reads as an artifact. Body sections go full-width. |
| ≤ 1000px | Credentials band groups drop 4 → 2 columns; ≤ 560px, 1 column. The 2×2 tally holds at every width. |
| ≤ 980px | The three-column masthead stacks and centres. The three fact stacks become a row of three beneath the buttons; ≤ 520px they stack too. |
| ≤ 900px | The lede's `1fr 320px` grid stacks — the plate moves below the copy. |
| ≤ 767px | `left`/`right` reveals collapse to `up` (existing rule) so sideways travel cannot nudge the document. `bow`/`wipe`/`focus` are direction-agnostic and unchanged. |
| ≤ 700px | The lede's two newspaper columns collapse to one. The drop cap stays. |
| ≤ 640px | Shell padding 24px → 16px. |

The masthead H1's `clamp()` floor (48px) carries it down to 375px without a
separate rule.

## Open, from the handoff

- **Practice-expectation numbers.** The Violin page's "Practice between lessons"
  section shipped **without** the three age/minute tiers in the comp — those
  were the designer's draft and the studio has no stated practice-minutes
  policy (MASTER §9). Owner decision 2026-08-25: keep the section's framing,
  drop the numbers. Add them back as a `cards` block once real figures exist.
- **Qanun lede plate** has no image; the comp used a drag-and-drop placeholder,
  which is a prototyping affordance and must not ship. Caption-only until a
  qanun photo exists.
- **Mobile** has still never been *designed* — the table above is a competent
  fallback, not a comp. Worth a design pass.
