"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { type AuthRole } from "@/lib/auth/roles"
import { Button } from "@/components/ui/button"

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h6.19a5.29 5.29 0 0 1-2.29 3.47v2.88h3.7c2.17-2 3.42-4.95 3.42-8.36z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.09 0 5.68-1.02 7.57-2.77l-3.7-2.88c-1.02.69-2.34 1.1-3.87 1.1-2.98 0-5.5-2.01-6.4-4.71H1.78v2.96A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.74a7.2 7.2 0 0 1 0-4.6V7.18H1.78a12 12 0 0 0 0 10.52l3.82-2.96z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.68 0 3.19.58 4.38 1.71l3.28-3.28C17.68 1.19 15.09 0 12 0A11.99 11.99 0 0 0 1.78 7.18l3.82 2.96C6.5 7.44 9.02 4.77 12 4.77z"
      />
    </svg>
  )
}

interface GoogleSignInButtonProps {
  role?: AuthRole
  label?: string
  showDivider?: boolean
}

export function GoogleSignInButton({
  role = "student",
  label = "Continue with Google",
  showDivider = true,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const errorId = "google-sign-in-error"

  const handleSignIn = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        },
      })

      // On success the browser redirects to Google, so keep the loading state.
      if (error) {
        setError(error.message)
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in with Google.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {showDivider && (
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-wood-mid/15" />
          <span className="text-xs uppercase tracking-[0.08em] text-wood-card-muted">or</span>
          <span className="h-px flex-1 bg-wood-mid/15" />
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={handleSignIn}
        disabled={isLoading}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-full border-wood-mid/20 bg-white/80 text-wood-card-fg hover:bg-wood-mid/6"
      >
        <GoogleLogo />
        {isLoading ? "Connecting..." : label}
      </Button>
      {error && (
        <p id={errorId} role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
