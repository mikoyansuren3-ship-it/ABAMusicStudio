"use client"

import { useActionState, type ReactNode } from "react"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { loginWithRole, type AuthActionState } from "@/app/auth/actions"
import { type AuthRole } from "@/lib/auth/roles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

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

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-serif text-2xl font-semibold text-[#3d2817]">{title}</h1>
        <p className="mt-1.5 text-sm text-[#6b5344]">{description}</p>
      </div>

      <form action={formAction}>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#4a3528]">
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
              className="border-[rgba(78,52,37,0.15)] bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[#4a3528]">
                Password
              </Label>
              <Link
                href="/auth/reset-password"
                className="text-xs text-[#8b6f5c] hover:text-[#4a3528]"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border-[rgba(78,52,37,0.15)] bg-white/80"
            />
          </div>
          <label
            htmlFor="remember_me"
            className="flex cursor-pointer items-start gap-2.5 rounded-md py-0.5"
          >
            <input
              type="checkbox"
              id="remember_me"
              name="remember_me"
              defaultChecked={defaultRememberMe}
              className={cn(
                "mt-0.5 size-4 shrink-0 rounded border border-[rgba(78,52,37,0.35)]",
                "accent-[#5e4e3c] focus-visible:ring-2 focus-visible:ring-[#5e4e3c]/40 focus-visible:outline-none",
              )}
            />
            <span className="text-sm leading-snug text-[#6b5344]">Remember me on this device</span>
          </label>
          {message && !state.error && (
            <p className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              {message}
            </p>
          )}
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button
            type="submit"
            className="w-full bg-[#5e4e3c] text-[#f5efe6] hover:bg-[#4a3d30]"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-[rgba(78,52,37,0.2)] bg-transparent text-[#4a3528] hover:bg-[rgba(78,52,37,0.06)]"
          >
            <Link href="/auth/login">Back to login options</Link>
          </Button>
        </div>
        {accountLink && (
          <div className="mt-6 text-center text-sm text-[#6b5344] [&_a]:text-[#4a3528] [&_a]:underline [&_a]:underline-offset-4">
            {accountLink}
          </div>
        )}
      </form>
    </>
  )
}
