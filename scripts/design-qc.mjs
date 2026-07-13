#!/usr/bin/env node
/**
 * Design QC guardrails for ABA Music Academy.
 * Enforces the rules in design-system/MASTER.md that can be checked statically.
 *
 * Usage: node scripts/design-qc.mjs   (wired as `npm run qc:design`)
 * Exits 1 with a report when a rule is violated.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const ROOT = process.cwd()
const SCAN_DIRS = ["app", "components", "lib"]
const TSX_RE = /\.(tsx|ts)$/

/**
 * Legacy surfaces still carrying bespoke hex/radii. Shrink this list over
 * time — never grow it without updating design-system/MASTER.md.
 */
const HEX_ALLOWLIST = [
  "components/auth/", // wood shell (partially tokenized)
  "components/portal/", // portal studio system
  "components/portal-sidebar.tsx",
  "components/profile-form.tsx",
  "components/notifications-view.tsx",
  "components/payments-view.tsx",
  "components/schedule-view.tsx", // portal studio system
  "app/portal/",
]

/** Raw <img> is allowed only where next/image cannot work (blob: previews). */
const RAW_IMG_ALLOWLIST = ["components/portal/profile-avatar-upload.tsx"]

/**
 * Owner-requested exception (2026-07-12): the services showcase keeps its
 * original editorial design (mono eyebrows, 28px radius, text arrows,
 * per-card themes). See design-system/pages/README.md.
 */
const SERVICES_SHOWCASE = "components/services/services-showcase.tsx"

const RADIUS_ALLOWLIST = [...HEX_ALLOWLIST, SERVICES_SHOWCASE]

/** Files allowed to render unicode music glyphs (dedicated music font). */
const GLYPH_ALLOWLIST = [
  "components/portal/",
  "components/auth/grand-staff-login.tsx",
  "app/portal/",
  SERVICES_SHOWCASE,
]

/** Files allowed to use font-mono on public surfaces. */
const MONO_ALLOWLIST = [SERVICES_SHOWCASE]

const checks = [
  {
    name: "no-arbitrary-hex-in-tsx",
    description:
      "Raw hex colors belong in globals.css / *.module.css, not Tailwind arbitrary values in TSX (design-system/MASTER.md §2)",
    fileFilter: (file) => file.endsWith(".tsx") && !inList(file, HEX_ALLOWLIST),
    pattern: /(?:text|bg|border|fill|stroke|outline|ring|from|via|to|shadow|decoration|caret|accent)-\[#[0-9a-fA-F]{3,8}\]/g,
  },
  {
    name: "no-symbol-glyph-icons",
    description:
      "No emoji / unicode symbol glyphs as icons or decoration — use lucide or inline SVG (design-system/MASTER.md §5)",
    fileFilter: (file) => file.endsWith(".tsx") && !inList(file, GLYPH_ALLOWLIST),
    pattern:
      /[☀-➿←-⇿⬀-⯿️]|[\uD83C-\uD83E][\uDC00-\uDFFF]|[♪-♯♩]|÷|∞|∫|Σ(?![\w])|√/g,
  },
  {
    name: "no-raw-img",
    description: "Use next/image instead of raw <img> (design-system/MASTER.md §8)",
    fileFilter: (file) => file.endsWith(".tsx") && !inList(file, RAW_IMG_ALLOWLIST),
    pattern: /<img[\s>]/g,
  },
  {
    name: "no-arbitrary-radius",
    description: "Use the radius scale (md/lg/xl/2xl/full), not rounded-[Npx] (design-system/MASTER.md §4)",
    fileFilter: (file) => file.endsWith(".tsx") && !inList(file, RADIUS_ALLOWLIST),
    pattern: /rounded-\[[^\]]+\]/g,
  },
  {
    name: "no-mono-on-public",
    description: "No third typeface on public pages (design-system/MASTER.md §3)",
    fileFilter: (file) =>
      file.endsWith(".tsx") &&
      !inList(file, MONO_ALLOWLIST) &&
      (file.startsWith(`app${sep}(public)`) || file.startsWith(`components${sep}public`) || file.startsWith(`components${sep}services`)),
    pattern: /font-mono/g,
  },
  {
    name: "image-requires-alt",
    description: "Every next/image needs an alt attribute (design-system/MASTER.md §8)",
    fileFilter: (file) => file.endsWith(".tsx"),
    // <Image ...> opening tags with no alt= inside the tag
    pattern: /<Image(?![^>]*\balt=)[^>]*>/gs,
  },
]

function inList(file, list) {
  const posix = file.split(sep).join("/")
  return list.some((entry) => (entry.endsWith("/") ? posix.startsWith(entry) : posix === entry))
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "ui"].includes(entry)) continue
    const full = join(dir, entry)
    const stats = statSync(full)
    if (stats.isDirectory()) yield* walk(full)
    else if (TSX_RE.test(entry)) yield full
  }
}

function lineOf(content, index) {
  return content.slice(0, index).split("\n").length
}

const failures = []

for (const dir of SCAN_DIRS) {
  let files
  try {
    files = [...walk(join(ROOT, dir))]
  } catch {
    continue
  }

  for (const file of files) {
    const rel = relative(ROOT, file)
    const content = readFileSync(file, "utf8")

    for (const check of checks) {
      if (!check.fileFilter(rel)) continue
      check.pattern.lastIndex = 0
      let match
      while ((match = check.pattern.exec(content)) !== null) {
        failures.push({
          check: check.name,
          file: rel,
          line: lineOf(content, match.index),
          snippet: match[0].slice(0, 60).replaceAll("\n", "\\n"),
          description: check.description,
        })
      }
    }
  }
}

if (failures.length === 0) {
  console.log("✓ design-qc: all checks passed")
  process.exit(0)
}

console.error(`✗ design-qc: ${failures.length} violation(s)\n`)
const byCheck = Map.groupBy(failures, (f) => f.check)
for (const [check, items] of byCheck) {
  console.error(`— ${check}: ${items[0].description}`)
  for (const item of items) {
    console.error(`    ${item.file}:${item.line}  ${item.snippet}`)
  }
  console.error("")
}
console.error("Fix the violations or (only with a documented reason) extend the allowlist in scripts/design-qc.mjs.")
process.exit(1)
