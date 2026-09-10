# Student Photo Usage

Rules and upkeep for the recital/lesson photos under `public/students/`.
Source library: the owner's Drive ("ABA CONTENT" folders — June 2026 concert,
Christmas recital, Summer 2025).

## Consent rules (non-negotiable)

1. **Media release on file for every identifiable child** before their photo
   ships. Standard fix: a media-consent line in the enrollment agreement.
   Where consent is uncertain, use wide stage shots or profile/from-behind
   crops.
2. **Never publish a student's name next to their face.** Captions and alt
   text name the moment and the event, never the student
   ("A first-year student's recital debut", not a name).
3. **Blur printed names before export.** `recital-june-2026-certificate.jpg`
   and `cohen-festival-winners.jpg` ship with the certificates' printed
   student names blurred into the asset itself (not CSS). Repeat for any
   future certificate/program photos.

## Export spec

- JPEG quality 80 (`next/image` serves AVIF/WebP from it automatically).
- Heroes ≤1920px wide, cards ≤900px.
- Descriptive kebab-case filenames (`recital-june-2026-duet.jpg`), anonymous
  alt text on every placement.
- Below-the-fold images lazy-load by default (`next/image`); only the
  homepage hero uses `priority`.

## Where each photo lives

| Asset | Placement |
|---|---|
| `recital-june-2026-stage.jpg` | Homepage hero |
| `recital-june-2026-{young-beginner,teen-soloist,duet}.jpg` | Homepage "Our Students on Stage" |
| `recital-june-2026-finale.jpg` | Homepage CTA band (softened) |
| `summer-2025-piano-lesson.jpg` | Piano program lede plate (`lib/programs.ts`) |
| `recital-june-2026-{first-recital,student-performing,teen-performing}.jpg` | Piano program "On stage" gallery |
| `cohen-festival-winners.jpg`, `recital-june-2026-certificate.jpg`, `recital-trophy-young-student.jpg`, `recital-students-honored.jpg` | `/awards` tiles (`lib/awards.ts`) |
| `founder-{guiding-student,four-hands}.jpg` | About — teaching candids (uncaptioned) |
| `student-focus-at-the-keys.jpg`, `students-holiday-recital-joy.jpg`, `recital-trophy-young-student.jpg` | About — studio-life row under the origin story (uncaptioned) |
| `studio-recital-finale-wide.jpg` | About — closing group photo (uncaptioned) |
| `teacher-student-after-recital.jpg` | Inquire — accent beside the form |
| `students-summer-park-gathering.jpg` | Contact — community photo |
| `programs/violin-student.png` | Violin program lede plate — user-supplied illustration, recolored |
| `programs/vocal-illustration.png` | Voice program lede plate — recolored from `services/vocal.png` |
| `programs/violin-hero.jpg` | Violin social card / schema image only — derived crop of `teachers/asya-anisimova.jpg`; not rendered on the page |
| `teachers/*.jpg` | Program pages — the "Your <instrument> teacher" section · `/faculty` |
| `teachers/marietta-galstyan-closeup.jpg` | Voice program teacher section only — head-and-shoulders crop of `teachers/marietta-galstyan.jpg` |

## Seasonal rotation — every December

The Christmas recital set is off-season most of the year; swap it in each
December (and revert after Jan 6):

- **Homepage hero** → `IMG_6120` from the library (girl in red at the white
  piano beside the tree) — export as `recital-christmas-hero.jpg`.
- **Homepage CTA band** → a red-and-black finale group shot
  (`IMG_6155`-series; `studio-recital-finale-wide.jpg` already exported).
- Announce the Christmas recital date alongside the swap.

Known gap: **no adult-student photos exist** — shoot one adult lesson before
illustrating adult-audience content with photography.

Known gap: **no violin or qanun photography exists.** A visual triage of the
`ABA Content/` library (41 of 104 images verified) found zero violin, zero
guitar, and zero non-piano instruments of any kind — the shot library is
entirely piano recital content.

Under the "Programme Notes" template (2026-08-25) the program pages have no hero
photograph at all — the masthead is typographic, and each page's one image sits
in the **lede plate** beside the intro copy. That absorbs most of the gap:

- **Violin** and **Voice** plates use illustrations, not photographs
  (`programs/violin-student.png`, `programs/vocal-illustration.png`). Both were
  recolored so only near-background pixels were remapped to the paper `#f4efe4`
  (drop shadows to a proportionally darker cream); subject pixels are untouched.
  **If you re-export either from source, apply the same treatment** or the
  artwork punches a bright rectangle through the parchment.
- **Piano** uses a real photograph (`students/summer-2025-piano-lesson.jpg`).
- **Qanun** runs the plate caption-only. Its only photo candidate was Gohar's
  portrait, which the teacher section on the same page already carries, and the
  design's placeholder was a prototyping affordance that must not ship.

`programs/violin-hero.jpg` — the instrument-first crop of
`teachers/asya-anisimova.jpg` — is retained but no longer rendered: it is now
only the violin page's schema.org / social-card image.

The program pages' teacher frame is a tall portrait the subject should fill.
Every teacher portrait suits that directly except **Marietta's**, which is a
wide stage shot she reads small in — `object-cover` crops but cannot zoom, so
that page uses a real derived crop, `teachers/marietta-galstyan-closeup.jpg`
(head and shoulders, mic and marquee bulbs behind). It is wired through the
optional `Teacher.closeUp` field and is used **only** there; `/faculty` still
shows the full stage frame. At 385x620 it is about 1.3x the rendered box on a
retina display — slightly soft, and as sharp as a 966px-wide source allows at
this magnification. A real studio portrait of Marietta would replace it.

Wanted, to close this properly:

| Wanted | For |
|---|---|
| `violin-lesson-bow-hold.jpg` | Violin lede plate — replaces the illustration. Frame the teacher's hands guiding a student's bow hold so no child's face is identifiable, which also sidesteps the media-release requirement |
| a voice-lesson or studio singing shot | Voice lede plate — replaces the illustration |
| a qanun lesson or performance shot | Qanun lede plate — the one page still running caption-only |
| an adult-student lesson shot | Piano "Who piano lessons are for" — the adults card is the only audience with no photography |

Consent flag from the same triage: `ABA CONTENT 1/02a564c5-0979-4de3-81ed-9e0492d72c60.JPG`
shows a child holding a certificate with her **full printed name legible**. Per
the rules above, that name must be blurred into the exported asset before any
public use — CSS blur is not sufficient.
