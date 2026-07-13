import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AuthWoodCard } from "@/components/auth/auth-wood-card"
import { LoginWoodBackground } from "@/components/auth/login-wood-background"
import { cn } from "@/lib/utils"

interface AuthShellProps {
  children: React.ReactNode
  className?: string
  showBrandLogo?: boolean
  logoSubtitle?: string
}

export function AuthShell({
  children,
  className,
  showBrandLogo = true,
  logoSubtitle = "Student & Teacher Portal",
}: AuthShellProps) {
  return (
    <LoginWoodBackground showLogo={showBrandLogo} logoSubtitle={logoSubtitle}>
      <AuthWoodCard className={cn("max-w-md", className)}>{children}</AuthWoodCard>

      <div className="mt-6 text-center">
        <Link
          href="/"
          prefetch={false}
          className="inline-flex items-center gap-1 rounded-sm border-b border-cream/15 pb-px text-xs text-cream/75 transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Back to home
        </Link>
      </div>
    </LoginWoodBackground>
  )
}
