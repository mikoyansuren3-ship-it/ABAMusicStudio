import Link from "next/link"
import { Music } from "lucide-react"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Music className="h-6 w-6 text-accent" />
            <span className="font-serif text-xl font-semibold">ABA Music Studio</span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  )
}
