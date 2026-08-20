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
| `summer-2025-piano-lesson.jpg` | Piano program hero (`lib/programs.ts`) |
| `recital-june-2026-{first-recital,student-performing,teen-performing}.jpg` | Piano program "From Our Recitals" gallery |
| `cohen-festival-winners.jpg`, `recital-june-2026-certificate.jpg`, `recital-trophy-young-student.jpg`, `recital-students-honored.jpg` | `/awards` tiles (`lib/awards.ts`) |
| `founder-{guiding-student,four-hands}.jpg` | About — teaching candids (uncaptioned) |
| `student-focus-at-the-keys.jpg`, `students-holiday-recital-joy.jpg`, `recital-trophy-young-student.jpg` | About — studio-life row under the origin story (uncaptioned) |
| `studio-recital-finale-wide.jpg` | About — closing group photo (uncaptioned) |
| `teacher-student-after-recital.jpg` | Inquire — accent beside the form |
| `students-summer-park-gathering.jpg` | Contact — community photo |

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
