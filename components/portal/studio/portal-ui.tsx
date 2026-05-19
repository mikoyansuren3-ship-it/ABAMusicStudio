"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import styles from "./portal-studio.module.css"

export function PortalPageHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
}) {
  return (
    <header
      className={cn(
        "flex shrink-0 flex-col gap-3 border-b border-[rgba(78,52,37,0.08)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8",
        styles.pageHeader,
      )}
    >
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#2b1b14]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[#8B7355]">{subtitle}</p> : null}
      </div>
      {right}
    </header>
  )
}

export function PortalPageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative px-6 py-6 sm:px-8 sm:py-6", className)}>
      <StaffLinesBg />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}

export function StaffLinesBg() {
  return (
    <div className="pointer-events-none absolute top-12 right-8 left-8 hidden sm:block" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="mb-3.5 h-px bg-[rgba(160,140,118,0.04)]" />
      ))}
    </div>
  )
}

export function SectionDivider({
  label,
  clef,
}: {
  label: string
  clef?: "treble" | "bass"
}) {
  return (
    <div className="my-6 flex items-center gap-2.5">
      {clef ? (
        <span
          className={cn(
            "font-[family-name:var(--font-noto-music)] leading-none text-[#C9A96E]",
            clef === "treble" ? "text-[22px]" : "text-lg",
          )}
        >
          {clef === "treble" ? "\u{1D11E}" : "\u{1D122}"}
        </span>
      ) : null}
      <span className="text-[11px] font-bold tracking-[0.12em] text-[#8B7355] uppercase">{label}</span>
      <div className="h-px flex-1 bg-[rgba(78,52,37,0.08)]" />
    </div>
  )
}

export function PortalCard({
  children,
  className,
  hover,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}) {
  const baseClass = cn(
    "w-full rounded-[14px] border border-[rgba(78,52,37,0.08)] bg-white text-left transition-all",
    hover &&
      "cursor-pointer hover:-translate-y-0.5 hover:border-[rgba(201,169,110,0.15)] hover:shadow-[0_6px_20px_rgba(43,27,20,0.06)]",
    className,
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={baseClass}>
        {children}
      </button>
    )
  }

  return <div className={baseClass}>{children}</div>
}

export function PortalStatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    confirmed: "bg-[rgba(59,37,24,0.08)] text-[#3B2518]",
    pending: "bg-[rgba(201,169,110,0.15)] text-[#8B6B30]",
    completed: "bg-[rgba(107,161,107,0.12)] text-[#4A7A4A]",
    cancelled: "bg-[rgba(180,70,70,0.1)] text-[#9A4040]",
    paid: "bg-[rgba(107,161,107,0.12)] text-[#4A7A4A]",
    unpaid: "bg-[rgba(196,122,44,0.12)] text-[#C47A2C]",
  }
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide uppercase",
        statusStyles[status] ?? statusStyles.pending,
      )}
    >
      {status}
    </span>
  )
}

export function PortalButton({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "gold" | "outline" | "ghost" | "danger"
}) {
  const variants = {
    primary: "bg-[#3B2518] text-[#F5EBD9] hover:bg-[#4E3425]",
    gold: "bg-[#C9A96E] text-[#2A1810] hover:bg-[#B8963E]",
    outline: "border-[1.5px] border-[rgba(78,52,37,0.08)] bg-transparent text-[#3B2518] hover:bg-[rgba(59,37,24,0.04)]",
    ghost: "bg-transparent text-[#8B7355] hover:bg-[rgba(59,37,24,0.04)]",
    danger: "border-[1.5px] border-[rgba(180,70,70,0.2)] bg-transparent text-[#9A4040] hover:bg-[#A03030] hover:text-white",
  }
  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function PortalLinkButton({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn("text-xs font-semibold text-[#C9A96E] transition-colors hover:text-[#B8963E]", className)}
    >
      {children}
    </Link>
  )
}

export function PortalCardFooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[rgba(78,52,37,0.06)] px-5 py-3 text-center">
      <PortalLinkButton href={href}>{children}</PortalLinkButton>
    </div>
  )
}

export function PortalEmptyState({ icon, message }: { icon?: React.ReactNode; message: string }) {
  return (
    <div className="py-12 text-center">
      {icon ?? (
        <span className="font-[family-name:var(--font-noto-music)] text-5xl text-[#B8A89A] opacity-40">
          {"\u{1D11E}"}
        </span>
      )}
      <p className="mt-3 text-sm text-[#8B7355]">{message}</p>
    </div>
  )
}

export function PortalDateBadge({
  iso,
  highlight,
  compact,
}: {
  iso: string
  highlight?: boolean
  compact?: boolean
}) {
  const d = new Date(iso)
  const month = d.toLocaleDateString("en-US", { month: "short" })
  const day = d.getDate()
  const size = compact ? "h-10 w-10 rounded-lg" : "h-[46px] w-[46px] rounded-[10px]"
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center",
        size,
        highlight
          ? "bg-gradient-to-br from-[#3B2518] to-[#4E3828] text-[#F5EBD9]"
          : "bg-[rgba(201,169,110,0.08)] text-[#3B2518]",
      )}
    >
      <span
        className={cn(
          "font-semibold uppercase",
          highlight ? "text-[9px] opacity-60" : "text-[8px] text-[#B8A89A]",
          compact && "text-[8px]",
        )}
      >
        {month}
      </span>
      <span className={cn("font-bold", compact ? "text-[15px]" : "text-[17px]", !highlight && "text-[#3B2518]")}>
        {day}
      </span>
    </div>
  )
}
