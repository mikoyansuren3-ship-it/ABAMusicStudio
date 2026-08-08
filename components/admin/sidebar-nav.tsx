"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sun, Calendar, Clock, UserPlus, Users, GraduationCap, Wallet, Bell, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

function buildGroups(studentCount: number): NavGroup[] {
  return [
    {
      label: "Studio",
      items: [
        { href: "/admin", label: "Today", icon: Sun },
        { href: "/admin/schedule", label: "Schedule", icon: Calendar },
        { href: "/admin/availability", label: "Availability", icon: Clock },
      ],
    },
    {
      label: "People",
      items: [
        { href: "/admin/inquiries", label: "Inquiries", icon: UserPlus },
        { href: "/admin/students", label: "Students", icon: Users, badge: studentCount },
        { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
      ],
    },
    {
      label: "Money",
      items: [
        { href: "/admin/money", label: "Invoices and income", icon: Wallet },
        { href: "/admin/announcements", label: "Announcements", icon: Bell },
      ],
    },
  ]
}

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`)
}

interface AdminSidebarProps {
  studentCount: number
  footerLines: [string, string]
}

/** 248px parchment sidebar with grouped destinations. Desktop and iPad only — see AdminMobileNav. */
export function AdminSidebar({ studentCount, footerLines }: AdminSidebarProps) {
  const pathname = usePathname()
  const groups = buildGroups(studentCount)

  return (
    <aside className="sticky top-[68px] hidden h-[calc(100svh-68px)] w-[248px] shrink-0 flex-col overflow-y-auto border-r bg-sidebar px-3 pb-3 pt-6 md:flex">
      <nav className="flex flex-1 flex-col gap-[22px]" aria-label="Admin">
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              {group.label}
            </div>
            {group.items.map((item) => {
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
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-y-[9px] left-0 w-[3px] rounded-r-full bg-accent"
                    />
                  )}
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
          </div>
        ))}
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
export function AdminMobileNav({ studentCount }: { studentCount: number }) {
  const pathname = usePathname()
  const items = buildGroups(studentCount).flatMap((group) => group.items)

  return (
    <nav
      aria-label="Admin"
      className="sticky top-[68px] z-30 flex gap-1 overflow-x-auto border-b bg-sidebar px-3 py-2 md:hidden"
    >
      {items.map((item) => {
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
