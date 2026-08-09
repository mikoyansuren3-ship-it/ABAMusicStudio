/**
 * Studio-time convention
 * ----------------------
 * All lesson scheduling in this app is wall-clock time at the studio
 * (America/Los_Angeles). `bookings.start_time` / `end_time` store that wall
 * clock AS IF IT WERE UTC — a 5:00 PM lesson is `17:00:00+00` in the database
 * no matter where the server or browser runs, and DST never shifts it.
 *
 * The rules that keep this coherent:
 * - Build storage values with `wallClockToUtc`, never `new Date("date T time")`
 *   (which parses in the machine's local zone).
 * - Read wall-clock parts with UTC accessors (`getUTCHours`, `dateKeyUtc`,
 *   `minutesUtc`), never local getters.
 * - Never compare these columns against `new Date()` — that's a real instant.
 *   Use `studioNow()`, which is "now" re-expressed in the same convention.
 * - Real instants (`created_at`, `paid_at`, auth timestamps…) stay real;
 *   don't run them through this module except via `studioNow` for display.
 */
export const STUDIO_TIME_ZONE = "America/Los_Angeles"

const studioParts = new Intl.DateTimeFormat("en-US", {
  timeZone: STUDIO_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

/** A real instant → the same moment re-expressed as studio wall-clock-as-UTC. */
export function toStudioWallClock(instant: Date): Date {
  const parts: Record<string, string> = {}
  for (const part of studioParts.formatToParts(instant)) parts[part.type] = part.value
  return new Date(
    Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    ),
  )
}

/** Wall-clock "now" at the studio, in the storage convention. */
export function studioNow(): Date {
  return toStudioWallClock(new Date())
}

/** "2026-08-10" + "17:00[:00]" (studio wall clock) → the storage value. */
export function wallClockToUtc(dateKey: string, time: string): Date {
  const padded = time.length === 5 ? `${time}:00` : time
  return new Date(`${dateKey}T${padded}Z`)
}

/** Storage value → its studio-local date key, e.g. "2026-08-10". */
export function dateKeyUtc(value: Date | string): string {
  return (typeof value === "string" ? new Date(value) : value).toISOString().slice(0, 10)
}

/** Storage value → minutes since midnight of its studio day. */
export function minutesUtc(value: Date | string): number {
  const date = typeof value === "string" ? new Date(value) : value
  return date.getUTCHours() * 60 + date.getUTCMinutes()
}

/**
 * Studio "today" as a local-midnight Date, for calendar-date math only
 * (week skeletons, day iteration). Its date PARTS are meaningful; never
 * call toISOString() on it — convert through `wallClockToUtc` instead.
 */
export function studioToday(): Date {
  const [year, month, day] = dateKeyUtc(studioNow()).split("-").map(Number)
  return new Date(year, month - 1, day)
}
