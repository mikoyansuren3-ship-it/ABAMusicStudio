import { WeekBands, type WeekBandDay } from "@/components/admin/week-bands"
import { AttendanceLegend } from "@/components/teacher/attendance-legend"

interface TeacherWeekCalendarProps {
  eyebrow: string
  days: WeekBandDay[]
  hourLabels: string[]
  scaleStart: number
  scaleEnd: number
}

/**
 * The week calendar as the teacher portal shows it: attendance-coloured bands
 * plus the key that explains them.
 *
 * A nine-hour scale with named chips can't compress to a phone, so below
 * ~640px the card scrolls sideways at its readable width instead of crushing
 * every label to an ellipsis. The lesson list under it stays the linear read.
 */
export function TeacherWeekCalendar({ eyebrow, days, hourLabels, scaleStart, scaleEnd }: TeacherWeekCalendarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="min-w-[620px]">
          <WeekBands
            eyebrow={eyebrow}
            days={days}
            hourLabels={hourLabels}
            scaleStart={scaleStart}
            scaleEnd={scaleEnd}
          />
        </div>
      </div>
      <AttendanceLegend />
    </div>
  )
}
