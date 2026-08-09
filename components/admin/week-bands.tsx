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
  /** Minutes since midnight for the first/last hour label — the shared axis every day row positions against. */
  scaleStart: number
  scaleEnd: number
  days: WeekBandDay[]
}

interface LaidOutLesson extends WeekBandLesson {
  lane: number
  /** Left edge in % of the band — always the lesson's true start on the hour scale. */
  left: number
  /** Ceiling in % so growing to fit the label never covers the next chip in the lane. */
  maxWidth: number
}

const BAND_PADDING = 4
const LANE_GAP = 4
const SINGLE_LANE_CHIP = 40
const MULTI_LANE_CHIP = 22
/** Label-width estimate: avg glyph px at text-[11px] + chip padding, against a conservative band width. */
const CHAR_PX = 6.5
const CHIP_EXTRA_PX = 36
const ASSUMED_BAND_PX = 900

/**
 * Chips anchor at their start time but size to their label, instead of the
 * duration-proportional width that truncated "Name · Time" in a 9-hour band.
 * Lanes are assigned by VISUAL space (estimated label width), not just time
 * overlap — back-to-back half-hour lessons would otherwise truncate each
 * other. The anchor is never shifted to fit the label: aligning with the hour
 * scale wins, and a chip that runs out of room truncates (the tooltip always
 * carries the exact times).
 */
function layoutDay(lessons: WeekBandLesson[], windowStart: number, window: number): { laidOut: LaidOutLesson[]; laneCount: number } {
  const toPercent = (minutes: number) => ((minutes - windowStart) / window) * 100
  const sorted = [...lessons].sort((a, b) => a.startMinutes - b.startMinutes)
  const laneEnds: number[] = []
  const laidOut: LaidOutLesson[] = sorted.map((lesson) => {
    const estWidth = Math.min(((lesson.label.length * CHAR_PX + CHIP_EXTRA_PX) / ASSUMED_BAND_PX) * 100, 60)
    const left = Math.min(Math.max(toPercent(lesson.startMinutes), 0), 96)
    let lane = laneEnds.findIndex((end) => end <= left + 0.01)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(0)
    }
    laneEnds[lane] = Math.max(left + estWidth, toPercent(lesson.startMinutes + lesson.durationMinutes))
    return { ...lesson, lane, left, maxWidth: 100 - left }
  })
  laidOut.forEach((lesson, index) => {
    const next = laidOut.slice(index + 1).find((other) => other.lane === lesson.lane)
    if (next) lesson.maxWidth = next.left - lesson.left - 0.75
  })
  return { laidOut, laneCount: laneEnds.length }
}

/**
 * The 7-day availability-band calendar card shared by the Schedule page and
 * teacher detail pages. Pure presentation — callers compute the day rows.
 */
export function WeekBands({ eyebrow, hourLabels, scaleStart, scaleEnd, days }: WeekBandsProps) {
  const scale = Math.max(scaleEnd - scaleStart, 60)
  const toScalePercent = (minutes: number) => Math.min(Math.max(((minutes - scaleStart) / scale) * 100, 0), 100)
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

      {days.map((day) => {
        // Chips and the day's open-window segment both position on the SHARED
        // hour scale, so a 5 PM lesson sits under the "5 PM" header label even
        // when this day's open window is narrower than the week's widest.
        const { laidOut, laneCount } = layoutDay(day.lessons, scaleStart, scale)
        const chipHeight = laneCount > 1 ? MULTI_LANE_CHIP : SINGLE_LANE_CHIP
        const bandHeight = 2 * BAND_PADDING + Math.max(laneCount, 1) * chipHeight + Math.max(laneCount - 1, 0) * LANE_GAP
        const windowLeft = toScalePercent(day.windowStart)
        const windowWidth = Math.max(toScalePercent(day.windowEnd) - windowLeft, 0)
        return (
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

            <div className="relative min-w-0 flex-1 overflow-hidden" style={{ height: `${bandHeight}px` }}>
              {day.closed ? (
                <div className="flex h-full items-center rounded-lg bg-muted px-4">
                  {day.bandText && <span className="truncate text-[13px] text-muted-foreground">{day.bandText}</span>}
                </div>
              ) : (
                <div
                  className={`absolute inset-y-0 flex items-center overflow-hidden px-4 ${
                    day.isToday
                      ? "rounded-r-lg border-l-2 border-accent bg-accent/7"
                      : "rounded-r-lg border-l-2 border-accent/45 bg-accent/4"
                  }`}
                  style={{ left: `${windowLeft}%`, width: `${windowWidth}%` }}
                >
                  {day.bandText && <span className="truncate text-[13px] text-muted-foreground">{day.bandText}</span>}
                </div>
              )}
              {laidOut.map((lesson) => {
                const minWidth = Math.min(Math.max((lesson.durationMinutes / scale) * 100, 4), lesson.maxWidth)
                return (
                  <span
                    key={lesson.id}
                    title={lesson.title}
                    className="absolute flex items-center overflow-hidden whitespace-nowrap rounded-md bg-primary px-2 text-[11px] font-medium text-primary-foreground"
                    style={{
                      left: `${lesson.left}%`,
                      top: `${BAND_PADDING + lesson.lane * (chipHeight + LANE_GAP)}px`,
                      height: `${chipHeight}px`,
                      width: "max-content",
                      minWidth: `${minWidth}%`,
                      maxWidth: `${lesson.maxWidth}%`,
                    }}
                  >
                    <span className="truncate">{lesson.label}</span>
                  </span>
                )
              })}
            </div>
          </div>
        )
      })}
    </AdminCard>
  )
}
