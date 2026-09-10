/**
 * Teacher identity colours for the admin schedule.
 *
 * Six fixed swatches (tokens `--teacher-1..6` in app/globals.css) are handed
 * out in roster order — the same sort the Teachers page uses — so a teacher
 * keeps their colour across weeks, filters, and deactivation. Colours are
 * never cycled: a seventh teacher, and lessons with no teacher, get the
 * default chip. Chips carry the hue as a stripe over a light tint with normal
 * foreground text, so labels never sit on the raw colour; the same hue
 * appears as a dot on the teacher filter tabs, which double as the legend.
 */
export interface TeacherSwatch {
  /** Lesson chip: stripe + tint, foreground text. */
  chip: string
  /** Legend dot next to the teacher's name. */
  dot: string
}

/** Written out in full so Tailwind can see every class. */
const SWATCHES: readonly TeacherSwatch[] = [
  { chip: "border-l-4 border-teacher-1 bg-teacher-1/22 text-foreground", dot: "bg-teacher-1" },
  { chip: "border-l-4 border-teacher-2 bg-teacher-2/22 text-foreground", dot: "bg-teacher-2" },
  { chip: "border-l-4 border-teacher-3 bg-teacher-3/22 text-foreground", dot: "bg-teacher-3" },
  { chip: "border-l-4 border-teacher-4 bg-teacher-4/28 text-foreground", dot: "bg-teacher-4" },
  { chip: "border-l-4 border-teacher-5 bg-teacher-5/28 text-foreground", dot: "bg-teacher-5" },
  { chip: "border-l-4 border-teacher-6 bg-teacher-6/22 text-foreground", dot: "bg-teacher-6" },
]

/** Lessons with no teacher, or a teacher past the sixth slot. */
export const UNASSIGNED_SWATCH: TeacherSwatch = {
  chip: "bg-primary text-primary-foreground",
  dot: "bg-primary",
}

/**
 * Map every teacher (active or not, in roster order) to a swatch. Returns a
 * lookup by teacher id; ids not in the map take UNASSIGNED_SWATCH.
 */
export function teacherSwatches(teachers: { id: string }[]): Map<string, TeacherSwatch> {
  const map = new Map<string, TeacherSwatch>()
  teachers.forEach((teacher, index) => {
    if (index < SWATCHES.length) map.set(teacher.id, SWATCHES[index])
  })
  return map
}

export function swatchFor(map: Map<string, TeacherSwatch>, teacherId: string | null): TeacherSwatch {
  return (teacherId && map.get(teacherId)) || UNASSIGNED_SWATCH
}
