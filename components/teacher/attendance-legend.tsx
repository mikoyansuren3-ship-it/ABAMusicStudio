/** Reads the calendar's chip colors back to the teacher who set them. */
export function AttendanceLegend() {
  const keys = [
    { label: "Came", className: "bg-accent" },
    { label: "No-show", className: "bg-destructive" },
    { label: "Not marked yet", className: "border border-dashed border-primary/50 bg-card" },
    { label: "Upcoming", className: "bg-primary" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[11px] text-muted-foreground">
      {keys.map((key) => (
        <span key={key.label} className="inline-flex items-center gap-1.5">
          <span aria-hidden className={`size-3 rounded-sm ${key.className}`} />
          {key.label}
        </span>
      ))}
    </div>
  )
}
