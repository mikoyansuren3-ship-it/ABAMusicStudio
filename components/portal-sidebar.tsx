"use client"

import type { User } from "@supabase/supabase-js"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Bell,
  UserIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import type { Profile } from "@/lib/types"
import { ProfileAvatar } from "@/components/portal/profile-avatar"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import styles from "@/components/portal/studio/portal-studio.module.css"

interface PortalSidebarProps {
  user: User
  profile: Profile | null
  unreadCount?: number
}

const menuItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/portal/schedule", label: "Schedule", icon: Calendar },
  { href: "/portal/payments", label: "Payments", icon: CreditCard },
  { href: "/portal/notifications", label: "Notifications", icon: Bell, badge: true },
  { href: "/portal/profile", label: "Profile", icon: UserIcon },
]

function SidebarNav({
  pathname,
  unreadCount,
  onNavigate,
}: {
  pathname: string
  unreadCount: number
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-3">
      {menuItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        const badge = item.badge ? unreadCount : 0
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]",
              active ? "bg-[rgba(201,169,110,0.15)]" : "hover:bg-[rgba(201,169,110,0.06)]",
            )}
          >
            <item.icon
              className={cn("h-[18px] w-[18px]", active ? "text-[#C9A96E]" : "text-[rgba(245,235,217,0.75)]")}
            />
            <span
              className={cn(
                "flex-1 text-[13.5px]",
                active ? "font-semibold text-[#C9A96E]" : "text-[rgba(245,235,217,0.9)]",
              )}
            >
              {item.label}
            </span>
            {badge > 0 ? (
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#C9A96E] text-[10px] font-bold text-[#1E1008]">
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}

export function PortalSidebar({ user, profile, unreadCount = 0 }: PortalSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const displayName = profile?.full_name || "Student"

  const sidebarContent = (
    <>
      <div className="border-b border-[rgba(201,169,110,0.15)] px-5 pb-5">
        <Link
          href="/portal"
          onClick={() => setMobileOpen(false)}
          className="inline-block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
        >
          <Image
            src="/aba-logo-cropped.png"
            alt="ABA Music Academy"
            width={160}
            height={48}
            className="h-12 w-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
          />
        </Link>
      </div>

      <div aria-hidden className="pointer-events-none relative px-5">
        <div className="absolute top-3 right-5 left-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-[7px] h-px bg-[rgba(245,235,217,0.04)]" />
          ))}
        </div>
      </div>

      <SidebarNav pathname={pathname} unreadCount={unreadCount} onNavigate={() => setMobileOpen(false)} />

      <div className="mx-3 mt-auto border-t border-[rgba(201,169,110,0.15)] p-3">
        <div className="flex items-center gap-2.5">
          <ProfileAvatar
            fullName={profile?.full_name}
            email={user.email}
            avatarPath={profile?.avatar_path}
            updatedAt={profile?.updated_at}
            size="sm"
            className="border-2"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#F5EBD9]">{displayName}</p>
            <p className="text-[10.5px] text-[rgba(245,235,217,0.7)]">Student</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md p-1.5 text-[rgba(245,235,217,0.25)] transition-colors hover:bg-[rgba(201,169,110,0.08)] hover:text-[rgba(245,235,217,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <button
        type="button"
        className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-[#3B2518] text-[#F5EBD9] shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5E34] lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--gold)] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu overlay"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col py-5 font-sans transition-transform lg:static lg:translate-x-0",
          styles.sidebar,
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <button
          type="button"
          className="absolute top-4 right-4 rounded-md p-1 text-[rgba(245,235,217,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  )
}
