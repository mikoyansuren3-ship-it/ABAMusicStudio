import type React from "react"

/**
 * Standard page intro for public pages: optional eyebrow, serif H1, lede.
 * Keeps the title scale consistent site-wide (text-4xl, md:text-5xl).
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string
  title: React.ReactNode
  lede?: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      ) : null}
      <h1 className={`font-serif text-4xl font-bold tracking-tight text-balance md:text-5xl ${eyebrow ? "mt-3" : ""}`}>
        {title}
      </h1>
      {lede ? <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{lede}</p> : null}
    </div>
  )
}
