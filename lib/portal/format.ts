/** Invoice amounts are stored in cents. */
export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

/** e.g. "Jul 12, 2026" — short date that keeps the year. */
export function formatMediumDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

/** e.g. "Sat, Jul 12, 3:30 PM" */
export function formatDateTime(iso: string) {
  return `${formatShortDate(iso)}, ${formatTime(iso)}`
}

export function formatMonthDay(iso: string) {
  const d = new Date(iso)
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }),
    day: d.getDate(),
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
  }
}

export function experienceLabel(level: string | null | undefined) {
  if (!level) return "Beginner"
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export function durationLabel(minutes: number | null | undefined) {
  if (!minutes) return "30 min"
  return `${minutes} min`
}
