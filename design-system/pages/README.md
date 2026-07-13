# Page-specific overrides

One file per page (`home.md`, `services.md`, …) documenting any deliberate
deviation from `../MASTER.md` — what differs, and why. If a page has no file
here, MASTER applies in full.

Current known deviations:

- **home**: hero `h1` may scale to `md:text-6xl` (flagship exception; MASTER §3).
- **services** (owner decision, 2026-07-12): keeps its original editorial
  design — full-viewport per-subject themed panels (`--card-*` vars in
  `app/globals.css`), mono eyebrows, `rounded-[28px]`, text arrows. Exempted
  in `scripts/design-qc.mjs` via `SERVICES_SHOWCASE`. MASTER §§3-5 do not
  apply to `components/services/services-showcase.tsx`.
