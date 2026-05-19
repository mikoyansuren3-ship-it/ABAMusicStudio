import Link from "next/link"

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
          className="border-b border-[rgba(245,235,217,0.15)] pb-px text-xs text-[rgba(245,235,217,0.35)] transition-colors hover:text-[rgba(245,235,217,0.6)]"
        >
          ← Back to home
        </Link>
      </div>
    </LoginWoodBackground>
  )
}
