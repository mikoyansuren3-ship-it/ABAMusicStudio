"use client"

import { useActionState, type ReactNode } from "react"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { loginWithRole, type AuthActionState } from "@/app/auth/actions"
import { type AuthRole } from "@/lib/auth/roles"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RoleLoginFormProps {
  role: AuthRole
  title: string
  description: string
  accountLink?: ReactNode
  message?: string | null
  defaultEmail?: string
  defaultRememberMe?: boolean
}

const initialState: AuthActionState = {}

export function RoleLoginForm({
  role,
  title,
  description,
  accountLink,
  message,
  defaultEmail = "",
  defaultRememberMe = true,
}: RoleLoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginWithRole.bind(null, role), initialState)
  const errorId = "login-error"

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-serif text-2xl font-semibold text-wood-card-fg">{title}</h1>
        <p className="mt-1.5 text-sm text-wood-card-muted">{description}</p>
      </div>

      <form action={formAction}>
        <div className="flex flex-col gap-4">
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
              defaultValue={defaultEmail}
              autoComplete="email"
              aria-invalid={state.error ? true : undefined}
              aria-describedby={state.error ? errorId : undefined}
              className="border-wood-mid/15 bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-wood-card-fg">
                Password
              </Label>
              <Link
                href="/auth/reset-password"
                className="text-xs text-wood-card-muted hover:text-wood-card-fg"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              aria-invalid={state.error ? true : undefined}
              aria-describedby={state.error ? errorId : undefined}
              className="border-wood-mid/15 bg-white/80"
            />
          </div>
          <label
            htmlFor="remember_me"
            className="flex cursor-pointer items-start gap-2.5 rounded-md py-0.5"
          >
            <Checkbox
              id="remember_me"
              name="remember_me"
              defaultChecked={defaultRememberMe}
              className="mt-0.5 border-wood-mid/35 data-[state=checked]:border-[#5e4e3c] data-[state=checked]:bg-wood-btn data-[state=checked]:text-wood-card"
            />
            <span className="text-sm leading-snug text-wood-card-muted">Remember me on this device</span>
          </label>
          {message && !state.error && (
            <p className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              {message}
            </p>
          )}
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
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-wood-mid/20 bg-transparent text-wood-card-fg hover:bg-wood-mid/6"
          >
            <Link href="/auth/login">Back to login options</Link>
          </Button>
        </div>
        {accountLink && (
          <div className="mt-6 text-center text-sm text-wood-card-muted [&_a]:text-wood-card-fg [&_a]:underline [&_a]:underline-offset-4">
            {accountLink}
          </div>
        )}
      </form>
    </>
  )
}
