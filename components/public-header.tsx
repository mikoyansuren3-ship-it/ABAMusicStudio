"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import styles from "./public-header.module.css"

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/faculty", label: "Faculty" },
  { href: "/lessons", label: "Lessons & Pricing" },
  { href: "/services", label: "Services" },
  { href: "/policies", label: "Policies" },
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
            <a href="tel:18188362322">818-836-2322</a>
            <span className={styles.utilitySep} aria-hidden>
              |
            </span>
            <a href="mailto:arpine@abamusicacademy.org" className={styles.utilityEmail}>
              arpine@abamusicacademy.org
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
              width={512}
              height={512}
              priority
            />
          </Link>

          <nav className={styles.navBar} aria-label="Primary">
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
      <SheetContent side="right" className="w-[300px]">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SheetDescription className="sr-only">
          Links to site pages, login, and lesson inquiries.
        </SheetDescription>
        <MobileNav onNavigate={() => setOpen(false)} pathname={pathname} />
      </SheetContent>
    </Sheet>
  )
}

function MobileNav({ onNavigate, pathname }: { onNavigate: () => void; pathname: string }) {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <nav className="flex flex-col gap-4" aria-label="Mobile primary">
        {navLinks.map((link) => (
          <Link
            key={link.href}
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
        ))}
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
