"use client"

import { useActionState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { loginWithRole, type AuthActionState } from "@/app/auth/actions"
import { type AuthRole } from "@/lib/auth/roles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RoleLoginFormProps {
  role: AuthRole
  title: string
  description: string
  accountLink?: ReactNode
  message?: string | null
}

const initialState: AuthActionState = {}

export function RoleLoginForm({ role, title, description, accountLink, message }: RoleLoginFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(loginWithRole.bind(null, role), initialState)

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [router, state.redirectTo])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/reset-password" className="text-xs text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            {message && !state.error && (
              <p className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                {message}
              </p>
            )}
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </div>
          {accountLink && <div className="mt-6 text-center text-sm">{accountLink}</div>}
        </form>
      </CardContent>
    </Card>
  )
}
