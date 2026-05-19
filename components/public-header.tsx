"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu } from "lucide-react"

import { PublicHeaderShapes } from "@/components/public-header-shapes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import styles from "./public-header.module.css"

const navLinks = [
  { href: "/about", label: "About" },
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
      <div className={styles.infoBar}>
        <a href="tel:18188362322">818-836-2322</a>
        <span className={styles.infoBarSep}>|</span>
        <a href="mailto:arpine@abamusicacademy.org">arpine@abamusicacademy.org</a>
        <UtilLinks />
      </div>

      <HeaderBand open={open} setOpen={setOpen} pathname={pathname} />

      <nav className={styles.navBar} aria-label="Primary">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(styles.navItem, pathname === link.href && styles.navItemActive)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

function UtilLinks() {
  return (
    <div className={styles.utilLinks}>
      <Link href="/auth/login">Login</Link>
      <Link href="/inquire">Inquire About Lessons</Link>
    </div>
  )
}

function HeaderBand({
  open,
  setOpen,
  pathname,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  pathname: string
}) {
  return (
    <div className={styles.headerBand}>
      <PublicHeaderShapes />
      <div className={styles.headerBandInner}>
        <Link href="/" className={styles.headerLogo}>
          <Image
            src="/aba-logo-cropped.png"
            alt="ABA Music Academy"
            width={512}
            height={512}
            priority
            className="h-[85px] w-auto object-contain"
          />
          <span className={styles.headerTagline}>Where talent meets tradition</span>
        </Link>

        <MobileMenu open={open} setOpen={setOpen} pathname={pathname} />
      </div>
    </div>
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
    <div className={styles.mobileMenuWrap}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className={styles.mobileMenuBtn}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <MobileNav onNavigate={() => setOpen(false)} pathname={pathname} />
        </SheetContent>
      </Sheet>
    </div>
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
            className={cn(
              "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              pathname === link.href && "text-foreground",
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
