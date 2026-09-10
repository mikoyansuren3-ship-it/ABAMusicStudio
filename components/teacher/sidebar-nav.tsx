"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Sun, Users, Wallet, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
}

/**
 * The teacher portal is deliberately four destinations: what is happening
 * today, the week around it, who you teach, and what you're owed for it.
 * Studio-side money (what students are billed, invoices, the studio's margin)
 * stays in the admin portal.
 */
function buildItems(studentCount: number): NavItem[] {
  return [
    { href: "/dashboard", label: "Today", icon: Sun },
    { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/dashboard/students", label: "Students", icon: Users, badge: studentCount },
    { href: "/dashboard/pay", label: "Pay", icon: Wallet },
  ]
}

function isActivePath(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(`${href}/`)
}

interface TeacherSidebarProps {
  studentCount: number
  footerLines: [string, string]
}

/** 248px parchment sidebar, matching the admin portal. Desktop and iPad only. */
export function TeacherSidebar({ studentCount, footerLines }: TeacherSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-[68px] hidden h-[calc(100svh-68px)] w-[248px] shrink-0 flex-col overflow-y-auto border-r bg-sidebar px-3 pb-3 pt-6 md:flex">
      <nav className="flex flex-1 flex-col gap-1" aria-label="Teacher">
        <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Studio</div>
        {buildItems(studentCount).map((item) => {
          const active = isActivePath(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm text-foreground transition-colors",
                active ? "bg-card font-semibold shadow-sm" : "hover:bg-muted/50",
              )}
            >
              {active && <span aria-hidden className="absolute inset-y-[9px] left-0 w-[3px] rounded-r-full bg-accent" />}
              <item.icon
                aria-hidden
                className={cn("size-[17px] shrink-0", active ? "text-accent" : "text-muted-foreground")}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="text-xs font-medium text-muted-foreground">{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="mt-3 border-t px-3 pb-1 pt-3">
        <span className="text-[11px] leading-4 text-muted-foreground">
          {footerLines[0]}
          <br />
          {footerLines[1]}
        </span>
      </div>
    </aside>
  )
}

/** Horizontal fallback nav for phones, where the fixed sidebar doesn't fit. */
export function TeacherMobileNav({ studentCount }: { studentCount: number }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Teacher"
      className="sticky top-[68px] z-30 flex gap-1 overflow-x-auto border-b bg-sidebar px-3 py-2 md:hidden"
    >
      {buildItems(studentCount).map((item) => {
        const active = isActivePath(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-[13px]",
              active ? "bg-card font-semibold shadow-sm" : "text-foreground hover:bg-muted/50",
            )}
          >
            <item.icon aria-hidden className={cn("size-4", active ? "text-accent" : "text-muted-foreground")} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
