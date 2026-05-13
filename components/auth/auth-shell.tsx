import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AuthShellProps {
  children: React.ReactNode
  className?: string
  showBrandLogo?: boolean
}

export function AuthShell({ children, className, showBrandLogo = true }: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-6">
      <div className={cn("w-full max-w-sm", className)}>
        {showBrandLogo ? (
          <div className="mb-8 text-center">
            <p className="bg-gradient-to-r from-[#4a251c] via-accent to-[#9a3f78] bg-clip-text font-serif text-3xl font-bold tracking-tight text-transparent italic sm:text-4xl">
              ABA Music Academy
            </p>
          </div>
        ) : null}

        {children}

        <div className="mt-6 text-center">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Link href="/" prefetch={false}>
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
