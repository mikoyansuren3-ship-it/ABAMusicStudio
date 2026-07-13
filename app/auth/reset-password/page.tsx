"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const errorId = "reset-password-error"

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const origin = window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/confirm?next=/auth/update-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      {sent ? (
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle className="h-12 w-12 text-accent" />
          <h3 className="mt-4 font-serif text-lg font-semibold text-wood-card-fg">Check Your Email</h3>
          <p className="mt-2 text-sm text-wood-card-muted">We&apos;ve sent a password reset link to {email}</p>
          <Button
            variant="outline"
            className="mt-6 border-wood-mid/20 bg-transparent text-wood-card-fg hover:bg-wood-mid/6"
            asChild
          >
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <h1 className="font-serif text-2xl font-semibold text-wood-card-fg">Reset Password</h1>
            <p className="mt-1.5 text-sm text-wood-card-muted">Enter your email to receive a reset link</p>
          </div>
          <form onSubmit={handleReset}>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-wood-card-fg">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-wood-card-muted hover:text-wood-card-fg">
                <ArrowLeft className="mr-1 inline h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </>
      )}
    </AuthShell>
  )
}
