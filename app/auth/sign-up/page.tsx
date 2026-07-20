"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { AuthShell } from "@/components/auth/auth-shell"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [consent, setConsent] = useState(false)
  const errorId = "sign-up-error"
  const isPasswordError = error ? /password/i.test(error) : false
  const isConsentError = error ? /privacy policy/i.test(error) : false

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!consent) {
      setError("Please agree to the Privacy Policy to create an account.")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const origin = window.location.origin
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/confirm?next=/portal/profile`,
          data: {
            full_name: fullName,
            privacy_policy_accepted: true,
            privacy_policy_accepted_at: new Date().toISOString(),
          },
        },
      })

      if (error) throw error
      setSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Unable to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      {sent ? (
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle className="h-12 w-12 text-accent" />
          <h3 className="mt-4 font-serif text-lg font-semibold text-wood-card-fg">Confirm Your Email</h3>
          <p className="mt-2 text-sm text-wood-card-muted">
            We sent a confirmation link to {email}. Open it to finish setting up your account.
          </p>
          <Button
            variant="outline"
            className="mt-6 border-wood-mid/20 bg-transparent text-wood-card-fg hover:bg-wood-mid/6"
            asChild
          >
            <Link href="/auth/student/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Student Login
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <h1 className="font-serif text-2xl font-semibold text-wood-card-fg">Create Account</h1>
            <p className="mt-1.5 text-sm text-wood-card-muted">Sign up for student portal access</p>
          </div>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-wood-card-fg">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-wood-mid/15 bg-white/80"
                />
              </div>
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
                  className="border-wood-mid/15 bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-wood-card-fg">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={isPasswordError ? true : undefined}
                  aria-describedby={isPasswordError ? errorId : undefined}
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
                  aria-invalid={isPasswordError ? true : undefined}
                  aria-describedby={isPasswordError ? errorId : undefined}
                  className="border-wood-mid/15 bg-white/80"
                />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(value) => setConsent(value === true)}
                  aria-invalid={isConsentError || undefined}
                  aria-describedby={isConsentError ? errorId : undefined}
                  className="mt-0.5 border-wood-mid/30 bg-white/80"
                />
                <Label htmlFor="consent" className="text-xs font-normal leading-relaxed text-wood-card-muted">
                  I agree to the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wood-card-fg underline underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                  .
                </Label>
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
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
              <GoogleSignInButton role="student" />
            </div>
            <div className="mt-6 text-center text-sm">
              <span className="text-wood-card-muted">Already have an account? </span>
              <Link href="/auth/student/login" className="text-wood-card-fg underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </>
      )}
    </AuthShell>
  )
}
