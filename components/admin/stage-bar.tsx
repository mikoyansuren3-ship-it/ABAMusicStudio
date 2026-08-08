"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ExternalLink, LogOut } from "lucide-react"
import { initials } from "@/lib/admin/format"
import type { Profile } from "@/lib/types"

interface StageBarProps {
  profile: Profile | null
  dateLabel: string
}

/** Dark wood top bar shared by every admin screen: brand, date, public-site link, account menu. */
export function StageBar({ profile, dateLabel }: StageBarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const fullName = profile?.full_name || "Admin"
  const firstName = fullName.split(" ")[0]

  return (
    <header className="sticky top-0 z-40 flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-gold/40 bg-wood-darkest px-4 md:px-7">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gold/35 bg-wood-dark">
          <Image src="/aba-music-academy-logo.png" alt="ABA Music Academy logo" width={32} height={32} className="size-8 object-contain" />
        </span>
        <span className="flex min-w-0 flex-col gap-[3px]">
          <span className="truncate font-serif text-[15px] tracking-[0.14em] text-cream">ABA MUSIC ACADEMY</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Admin portal</span>
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3 md:gap-5">
        <span className="hidden text-[13px] text-cream/70 lg:inline">{dateLabel}</span>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-[7px] text-[13px] text-gold transition-colors hover:text-gold-strong focus-visible:outline-2 focus-visible:outline-gold"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          Public site
        </Link>
        <span className="hidden h-[22px] w-px bg-cream/20 md:block" aria-hidden />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2.5 rounded-lg py-1 pr-1 focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="Account menu"
          >
            <span className="flex size-[30px] items-center justify-center rounded-full border border-gold bg-wood-main text-xs font-semibold text-cream">
              {initials(fullName, "A")}
            </span>
            <span className="hidden text-[13px] text-cream sm:inline">{firstName}</span>
            <ChevronDown className="size-[15px] text-cream/60" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
