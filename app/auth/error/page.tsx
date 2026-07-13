import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams
  const errorMessage = params?.message || params?.error

  return (
    <AuthShell>
      <div className="mb-6 text-center">
        <h1 className="flex items-center justify-center gap-2 font-serif text-2xl font-semibold text-wood-card-fg">
          <AlertCircle aria-hidden="true" className="h-6 w-6 text-destructive" />
          Authentication Error
        </h1>
      </div>
      {errorMessage ? (
        <p className="text-center text-sm text-wood-card-muted">Error: {errorMessage}</p>
      ) : (
        <p className="text-center text-sm text-wood-card-muted">An unspecified error occurred.</p>
      )}
      <Button className="mt-6 w-full bg-wood-btn text-wood-card hover:bg-wood-btn-hover" asChild>
        <Link href="/auth/login">Back to Login</Link>
      </Button>
    </AuthShell>
  )
}
