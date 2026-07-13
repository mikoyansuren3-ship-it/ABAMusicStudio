"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { AuthShell } from "@/components/auth/auth-shell"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [updated, setUpdated] = useState(false)
  const router = useRouter()
  const errorId = "update-password-error"

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session))
      setIsCheckingSession(false)
    })
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setUpdated(true)
      setTimeout(() => router.push("/auth/login"), 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      {isCheckingSession ? (
        <div className="py-4 text-center text-sm text-wood-card-muted">Checking reset link...</div>
      ) : !hasSession ? (
        <div className="flex flex-col items-center py-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h3 className="mt-4 font-serif text-lg font-semibold text-wood-card-fg">Reset Link Required</h3>
          <p className="mt-2 text-sm text-wood-card-muted">
            Please open the password reset link from your email, or request a new one.
          </p>
          <Button className="mt-6 bg-wood-btn text-wood-card hover:bg-wood-btn-hover" asChild>
            <Link href="/auth/reset-password">Request New Link</Link>
          </Button>
        </div>
      ) : updated ? (
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle className="h-12 w-12 text-accent" />
          <h3 className="mt-4 font-serif text-lg font-semibold text-wood-card-fg">Password Updated!</h3>
          <p className="mt-2 text-sm text-wood-card-muted">Redirecting you to login...</p>
          <Button className="mt-6 bg-wood-btn text-wood-card hover:bg-wood-btn-hover" asChild>
            <Link href="/auth/login">Continue to your portal now</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <h1 className="font-serif text-2xl font-semibold text-wood-card-fg">Update Password</h1>
            <p className="mt-1.5 text-sm text-wood-card-muted">Enter your new password</p>
          </div>
          <form onSubmit={handleUpdate}>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-wood-card-fg">
                  New Password
                </Label>
                <PasswordInput
                  id="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className="border-wood-mid/15 bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-wood-card-fg">
                  Confirm Password
                </Label>
                <PasswordInput
                  id="confirmPassword"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className="border-wood-mid/15 bg-white/80"
                />
              </div>
              {error && (
                <p id={errorId} role="alert" aria-live="polite" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-wood-btn text-wood-card hover:bg-wood-btn-hover"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </>
      )}
    </AuthShell>
  )
}
