import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

/** Terracotta all-caps card label ("TODAY'S LESSONS", "ENROLLED", …). */
export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("text-[10px] font-semibold uppercase tracking-[0.18em] text-accent", className)}>
      {children}
    </span>
  )
}

/** Parchment card: 12px radius, hairline border, soft shadow. */
export function AdminCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("rounded-xl border bg-card px-6 py-[22px] shadow-sm", className)}>{children}</div>
}

/** Page header: Playfair H1 + one-line data summary, actions pinned right. */
export function PageHeader({
  title,
  summary,
  actions,
}: {
  title: string
  summary: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-[34px] font-bold leading-[1.15]">{title}</h1>
        <p className="text-[15px] text-muted-foreground">{summary}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3.5">{actions}</div> : null}
    </div>
  )
}

/** Centered empty state inside a card: Playfair headline, explainer, one CTA. */
export function EmptyState({
  title,
  children,
  cta,
  className,
}: {
  title: string
  children: React.ReactNode
  cta?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      <p className="font-serif text-2xl font-semibold">{title}</p>
      <p className="max-w-[460px] text-sm leading-[22px] text-pretty text-muted-foreground">{children}</p>
      {cta ? <div className="mt-1.5">{cta}</div> : null}
    </div>
  )
}

/** Dashed terracotta ghost button used by empty states. */
export function DashedButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-accent bg-transparent px-3.5",
        "text-[13px] font-semibold text-accent-strong transition-colors hover:bg-accent/5",
        "focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface PillTab {
  href: string
  label: string
  count?: number
  active: boolean
}

/** Bordered pill-tab group (Inquiries statuses, Money tabs). Tabs are links so state lives in the URL. */
export function PillTabs({ tabs, className }: { tabs: PillTab[]; className?: string }) {
  return (
    <div className={cn("flex w-fit max-w-full items-center gap-1.5 overflow-x-auto rounded-lg border bg-card p-1", className)}>
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "inline-flex h-[34px] shrink-0 items-center gap-2 rounded-md px-4 text-[13px] transition-colors",
            tab.active
              ? "bg-primary font-semibold text-primary-foreground"
              : "font-medium text-foreground hover:bg-muted/50",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={tab.active ? "opacity-70" : "text-muted-foreground"}>{tab.count}</span>
          )}
        </Link>
      ))}
    </div>
  )
}

/** 38px square outline button for chevron period navigation, rendered as a link. */
export function NavSquareLink({
  href,
  ariaLabel,
  children,
}: {
  href: string
  ariaLabel: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex size-[38px] items-center justify-center rounded-lg border bg-card text-foreground transition-colors hover:bg-muted/50"
    >
      {children}
    </Link>
  )
}
