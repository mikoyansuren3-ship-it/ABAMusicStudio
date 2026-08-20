"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { SITE } from "@/lib/site"

import styles from "./public-header.module.css"

type NavLink = { href: string; label: string }
type NavGroup = { label: string; items: NavLink[] }

const navGroups: NavGroup[] = [
  {
    label: "About",
    items: [
      { href: "/about", label: "About Us" },
      { href: "/faculty", label: "Our Teachers" },
      { href: "/awards", label: "Awards" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    label: "Music Programs",
    items: [
      { href: "/programs/piano-lessons", label: "Piano Lessons" },
      { href: "/programs/voice-lessons", label: "Voice Lessons" },
      { href: "/programs/violin-lessons", label: "Violin Lessons" },
      { href: "/programs/qanun-lessons", label: "Qanun Lessons" },
      { href: "/services", label: "Upcoming Services" },
    ],
  },
]

const navLinks: NavLink[] = [
  { href: "/lessons", label: "Lessons" },
  { href: "/employment", label: "Employment" },
  { href: "/contact", label: "Contact" },
]

export function PublicHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className={styles.headerRoot}>
      {/* Tier 1: contact + login */}
      <div className={styles.utilityBar}>
        <div className={`${styles.utilityInner} container mx-auto px-4`}>
          <div className={styles.utilityContact}>
            <a href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a>
            <span className={styles.utilitySep} aria-hidden>
              |
            </span>
            <a href={`mailto:${SITE.email}`} className={styles.utilityEmail}>
              {SITE.email}
            </a>
          </div>
          <Link href="/auth/login" className={styles.utilityLogin}>
            Login
          </Link>
        </div>
      </div>

      {/* Tier 2: logo, nav, CTA */}
      <div className={styles.mainBar}>
        <div className={`${styles.mainInner} container mx-auto px-4`}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/aba-logo-cropped.png"
              alt="ABA Music Academy"
              width={445}
              height={198}
              sizes="(max-width: 768px) 140px, 200px"
              priority
            />
          </Link>

          <nav className={styles.navBar} aria-label="Primary">
            {navGroups.map((group) => (
              <NavDropdown key={group.label} group={group} pathname={pathname} />
            ))}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(styles.navItem, pathname === link.href && styles.navItemActive)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <Link href="/inquire" className={styles.ctaButton}>
              Inquire About Lessons
            </Link>
            <MobileMenu open={open} setOpen={setOpen} pathname={pathname} />
          </div>
        </div>
      </div>
    </header>
  )
}

function NavDropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const groupActive = group.items.some((item) => item.href === pathname)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(styles.navItem, styles.navTrigger, groupActive && styles.navItemActive)}
      >
        {group.label}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        {group.items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn("w-full cursor-pointer", pathname === item.href && "font-semibold text-accent-strong")}
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileMenu({
  open,
  setOpen,
  pathname,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  pathname: string
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={styles.mobileMenuBtn}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] overflow-y-auto">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SheetDescription className="sr-only">
          Links to site pages, login, and lesson inquiries.
        </SheetDescription>
        <MobileNav onNavigate={() => setOpen(false)} pathname={pathname} />
      </SheetContent>
    </Sheet>
  )
}

function MobileNavLink({
  link,
  pathname,
  onNavigate,
}: {
  link: NavLink
  pathname: string
  onNavigate: () => void
}) {
  return (
    <Link
      href={link.href}
      aria-current={pathname === link.href ? "page" : undefined}
      className={cn(
        "rounded-sm py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        pathname === link.href && "font-semibold text-foreground",
      )}
      onClick={onNavigate}
    >
      {link.label}
    </Link>
  )
}

function MobileNav({ onNavigate, pathname }: { onNavigate: () => void; pathname: string }) {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <nav className="flex flex-col gap-5" aria-label="Mobile primary">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{group.label}</p>
            <div className="flex flex-col gap-2 border-l pl-3">
              {group.items.map((link) => (
                <MobileNavLink key={link.href} link={link} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-2 border-t pt-4">
          {navLinks.map((link) => (
            <MobileNavLink key={link.href} link={link} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>
      <div className="flex flex-col gap-3 border-t pt-4">
        <Button variant="outline" asChild>
          <Link href="/auth/login" onClick={onNavigate}>
            Login
          </Link>
        </Button>
        <Button asChild>
          <Link href="/inquire" onClick={onNavigate}>
            Inquire About Lessons
          </Link>
        </Button>
      </div>
    </div>
  )
}
