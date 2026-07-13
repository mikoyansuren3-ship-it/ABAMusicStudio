"use client"

import { useActionState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { signUpTeacher, type AuthActionState } from "@/app/auth/actions"
import { AuthShell } from "@/components/auth/auth-shell"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: AuthActionState = {}

export default function TeacherSignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpTeacher, initialState)
  const errorId = "teacher-sign-up-error"
  const isPasswordError = state.error ? /password/i.test(state.error) : false
  const isCodeError = state.error ? /code/i.test(state.error) : false

  return (
    <AuthShell>
      {state.success ? (
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle className="h-12 w-12 text-accent" />
          <h3 className="mt-4 font-serif text-lg font-semibold text-wood-card-fg">Confirm Your Email</h3>
          <p className="mt-2 text-sm text-wood-card-muted">{state.message}</p>
          <Button
            variant="outline"
            className="mt-6 border-wood-mid/20 bg-transparent text-wood-card-fg hover:bg-wood-mid/6"
            asChild
          >
            <Link href="/auth/teacher/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teacher Login
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <h1 className="font-serif text-2xl font-semibold text-wood-card-fg">Create Teacher Account</h1>
            <p className="mt-1.5 text-sm text-wood-card-muted">
              Enter the teacher access code to request dashboard access.
            </p>
          </div>
          <form action={formAction}>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-wood-card-fg">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  required
                  placeholder="Your name"
                  autoComplete="name"
                  className="border-wood-mid/15 bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-wood-card-fg">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="border-wood-mid/15 bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-wood-card-fg">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  aria-invalid={isPasswordError ? true : undefined}
                  aria-describedby={isPasswordError ? errorId : undefined}
                  className="border-wood-mid/15 bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-wood-card-fg">
                  Confirm Password
                </Label>
                <PasswordInput
                  id="confirm_password"
                  name="confirm_password"
                  required
                  autoComplete="new-password"
                  aria-invalid={isPasswordError ? true : undefined}
                  aria-describedby={isPasswordError ? errorId : undefined}
                  className="border-wood-mid/15 bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher_code" className="text-wood-card-fg">
                  Teacher Access Code
                </Label>
                <Input
                  id="teacher_code"
                  name="teacher_code"
                  type="password"
                  required
                  autoComplete="off"
                  aria-invalid={isCodeError ? true : undefined}
                  aria-describedby={isCodeError ? errorId : undefined}
                  className="border-wood-mid/15 bg-white/80"
                />
              </div>
              {state.error && (
                <p id={errorId} role="alert" aria-live="polite" className="text-sm text-destructive">
                  {state.error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-wood-btn text-wood-card hover:bg-wood-btn-hover"
                disabled={isPending}
              >
                {isPending ? "Creating account..." : "Create Teacher Account"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm">
              <span className="text-wood-card-muted">Already have an account? </span>
              <Link href="/auth/teacher/login" className="text-wood-card-fg underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </>
      )}
    </AuthShell>
  )
}
