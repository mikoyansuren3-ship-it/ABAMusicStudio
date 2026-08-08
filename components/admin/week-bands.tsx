import { AdminCard, Eyebrow } from "@/components/admin/ui"

export interface WeekBandLesson {
  id: string
  /** Short text inside the block, e.g. "Ashot · 4:00 PM". */
  label: string
  /** Hover title with the full detail. */
  title: string
  /** Minutes since midnight, local. */
  startMinutes: number
  durationMinutes: number
}

export interface WeekBandDay {
  key: string
  /** Gutter eyebrow, e.g. "TODAY · WED" or "THU". */
  eyebrow: string
  isToday: boolean
  /** Gutter date, e.g. "Aug 6". */
  dateLabel: string
  closed: boolean
  /** Band text when there are no lessons (or "Closed"). */
  bandText: string | null
  windowStart: number
  windowEnd: number
  lessons: WeekBandLesson[]
}

interface WeekBandsProps {
  eyebrow: string
  hourLabels: string[]
  days: WeekBandDay[]
}

/**
 * The 7-day availability-band calendar card shared by the Schedule page and
 * teacher detail pages. Pure presentation — callers compute the day rows.
 */
export function WeekBands({ eyebrow, hourLabels, days }: WeekBandsProps) {
  return (
    <AdminCard className="flex flex-col gap-3.5 pb-[26px]">
      <div className="flex items-center gap-5">
        <Eyebrow className="w-[104px] shrink-0">{eyebrow}</Eyebrow>
        <div className="flex flex-1 justify-between text-[11px] font-medium text-muted-foreground">
          {hourLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      {days.map((day) => (
        <div key={day.key} className="flex items-center gap-5 border-t py-3">
          <span className="flex w-[104px] shrink-0 flex-col gap-[3px]">
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                day.isToday ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {day.eyebrow}
            </span>
            <span
              className={`font-serif text-[19px] font-semibold leading-none ${
                day.closed ? "text-muted-foreground" : ""
              }`}
            >
              {day.dateLabel}
            </span>
          </span>

          <div
            className={`relative flex h-12 min-w-0 flex-1 items-center overflow-hidden px-4 ${
              day.closed
                ? "rounded-lg bg-muted"
                : day.isToday
                  ? "rounded-r-lg border-l-2 border-accent bg-accent/7"
                  : "rounded-r-lg border-l-2 border-accent/45 bg-accent/4"
            }`}
          >
            {day.bandText && <span className="truncate text-[13px] text-muted-foreground">{day.bandText}</span>}
            {day.lessons.map((lesson) => {
              const window = Math.max(day.windowEnd - day.windowStart, 60)
              const left = Math.min(Math.max(((lesson.startMinutes - day.windowStart) / window) * 100, 0), 96)
              const width = Math.min(Math.max((lesson.durationMinutes / window) * 100, 4), 100 - left)
              return (
                <span
                  key={lesson.id}
                  title={lesson.title}
                  className="absolute inset-y-1 flex items-center overflow-hidden whitespace-nowrap rounded-md bg-primary px-2 text-[11px] font-medium text-primary-foreground"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <span className="truncate">{lesson.label}</span>
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </AdminCard>
  )
}
