# ABA Music Academy — Design System (Master)

Source of truth for every visual decision on this site. Page-specific deviations
live in `design-system/pages/<page>.md` and override this file. If a rule here
blocks good work, change the rule here first — don't fork it silently in code.

Enforced automatically by `npm run qc:design` (see “Quality gates” below).

---

## 1. Brand model — two surfaces

| Surface | Where | Palette | Accent |
|---|---|---|---|
| **Stage** (dark) | Public header, footer, auth shell, portal sidebar | Wood browns `--wood-darkest → --wood-mid`, text `--cream` | Gold `--gold` / `--gold-strong` |
| **Parchment** (light) | All page content, cards, portal/admin bodies | Semantic tokens (`--background` cream, `--card`, `--muted`) | Terracotta `--accent` |

Rules:
- Gold lives only on stage surfaces; terracotta only on parchment surfaces.
- Pink appears **only inside the logo asset** and the decorative awards-section
  vines (`--vine-pink-1..4`, see `components/public/piano-note-vine.tsx`) —
  never as a general UI color (text, buttons, borders, states, icons).
- The 7 services subject themes supply `--svc-accent` (AA on cream) + `--svc-tint`
  per subject, defined in `app/globals.css`. Cards otherwise share `bg-card`.
- Status semantics: money due / attention = `text-accent`; overdue / errors /
  destructive = `text-destructive`; success = accent or neutral + icon, never
  raw `green-600`.

## 2. Color usage

- Components consume **semantic tokens** (`bg-card`, `text-muted-foreground`,
  `border-border`, `text-accent`…). Raw hex is allowed only in:
  `app/globals.css`, `*.module.css` (chrome layer), and the legacy allowlist in
  `scripts/design-qc.mjs` (auth wood + portal studio, shrinking over time).
- Never introduce a new accent hue. New feature = existing tokens.
- Text contrast: ≥4.5:1 body, ≥3:1 for ≥18px/bold. On wood, cream text at
  opacity <0.7 fails — don't ship it.

## 3. Typography

- Headings: Playfair Display (`font-serif`). Body/UI: Inter (`font-sans`).
  No third typeface (no `font-mono` on public pages).
- Scale: page `h1` = `text-4xl md:text-5xl` (home hero alone may use
  `md:text-6xl`); section `h2` = `text-3xl`; sub-section/panel `h2/h3` =
  `text-2xl`; card headings = `font-semibold` sans (or `font-serif text-2xl`
  for featured cards). Never let a section heading match the page h1 size.
- Heading levels are sequential — no h2→h4 skips; card titles that act as
  section content use real heading elements, not styled `div`s.
- Eyebrows: `text-xs font-semibold uppercase tracking-[0.18em] text-accent`.

## 4. Layout & spacing

- Page container: `container mx-auto px-4` — header nav, page body, and footer
  inner all align to it. No bespoke max-widths (`max-w-[1400px]`, 1140px, …).
- Section rhythm: `py-16 md:py-24` per page section; intra-section gaps from
  {`mt-10`, `mt-12`, `mt-16`, `mt-24`}. No `pb-24`-style stacking on `<main>`.
- Radius scale: buttons/inputs `rounded-md`, small blocks & images `rounded-lg`
  , cards `rounded-xl`, feature panels & auth card `rounded-2xl`, pills
  `rounded-full`. **No arbitrary radii** (`rounded-[Npx]`) outside the legacy
  allowlist.

## 5. Iconography & decoration

- UI icons: **lucide-react only**, one stroke style, sized `h-4/5/6`.
- No emoji and no unicode symbol glyphs (♪ ♞ π Σ ∫ …) as UI or decoration in
  TSX — decorative motifs are inline **SVG** with `aria-hidden` (see
  `components/public-header-shapes.tsx`). Music motifs only; the brand is a
  music academy first (chess/math live on the Services page as content, not
  chrome).
- Decorative layers never intercept pointer events and never carry
  `aria-label`.

## 6. Interaction & accessibility

- Every interactive element has a **visible `:focus-visible`** treatment:
  gold `outline-2` on stage surfaces, `ring`/outline token on parchment.
- Hover-only affordances must also appear via `group-focus-within` (and be
  visible by default on touch breakpoints).
- Touch targets ≥44px on mobile (buttons `size="lg"` or padding equivalents).
- Forms: visible `<Label htmlFor>` per field, correct `type` + `autoComplete`,
  errors adjacent to the field with `role="alert" aria-live="polite"` and
  `aria-invalid`/`aria-describedby` on the input, submit buttons show a
  pending state. Password fields get a show/hide toggle.
- Icon-only buttons require `aria-label` or `sr-only` text.
- `aria-current="page"` on active nav items.

## 7. Motion

- Micro-interactions 150–300ms, `ease-out` in / `ease-in` out; animate
  `transform`/`opacity` only. Respect `prefers-reduced-motion` for anything
  larger than a hover tint.

## 8. Imagery

- `next/image` only (no raw `<img>`), meaningful `alt` text, correct
  `width/height` or aspect wrapper to avoid CLS. No `filter: brightness()`
  hacks to recolor logos — use the correct asset.

## 9. Content honesty

- No placeholder/TODO content on public pages — gate unfinished data
  (see `publishedTeachers` in `lib/teachers.ts`).
- No dead controls: a `<button>` without a handler is a badge, not a button.
- Every form that looks like it submits, submits (server action), and says
  what happens next.

## 10. Quality gates (run before shipping UI)

1. `npm run qc:design` — token/icon/radius/image guardrails (must pass).
2. `npm run lint` and `npx tsc --noEmit` — must pass.
3. `npm run build` — must pass.
4. Manual: check 375px + desktop, keyboard-tab the page (focus visible end to
   end), verify browser console has zero errors, spot-check contrast of any
   new text-on-color pairing.
