"use client"

import { useActionState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { signUpTeacher, type AuthActionState } from "@/app/auth/actions"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: AuthActionState = {}

export default function TeacherSignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpTeacher, initialState)

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Teacher Account</CardTitle>
          <CardDescription>Enter the teacher access code to request dashboard access.</CardDescription>
        </CardHeader>
        <CardContent>
          {state.success ? (
            <div className="flex flex-col items-center py-4 text-center">
              <CheckCircle className="h-12 w-12 text-accent" />
              <h3 className="mt-4 font-semibold">Confirm Your Email</h3>
              <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
              <Button variant="outline" className="mt-6 bg-transparent" asChild>
                <Link href="/auth/teacher/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Teacher Login
                </Link>
              </Button>
            </div>
          ) : (
            <form action={formAction}>
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" name="full_name" required placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input id="confirm_password" name="confirm_password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher_code">Teacher Access Code</Label>
                  <Input id="teacher_code" name="teacher_code" type="password" required />
                </div>
                {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Creating account..." : "Create Teacher Account"}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/auth/teacher/login" className="text-foreground underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
