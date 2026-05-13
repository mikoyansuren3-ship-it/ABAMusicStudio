import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { GraduationCap, ShieldCheck, UserRoundCog } from "lucide-react"

export default function LoginPage() {
  return (
    <AuthShell className="max-w-2xl" showBrandLogo={false}>
      <div className="mb-8 text-center">
        <p className="bg-gradient-to-r from-[#4a251c] via-accent to-[#9a3f78] bg-clip-text font-serif text-4xl font-bold tracking-tight text-transparent italic sm:text-5xl">
          ABA Music Academy
        </p>
        <p className="mt-2 text-sm font-medium tracking-[0.35em] text-accent/80 uppercase">Student & Teacher Portal</p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Login</CardTitle>
          <CardDescription>Select the portal that matches your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              asChild
              variant="outline"
              className="h-auto min-h-48 w-full whitespace-normal rounded-2xl border-accent/30 bg-background/70 p-6 text-center shadow-sm hover:bg-accent/10"
            >
              <Link href="/auth/student/login" className="flex flex-col items-center justify-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <GraduationCap className="h-8 w-8 text-accent" />
                </span>
                <span>
                  <span className="block text-xl font-semibold">Student Login</span>
                  <span className="mt-2 block text-sm leading-relaxed font-normal text-muted-foreground">
                    Access schedules, payments, and profile details.
                  </span>
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto min-h-48 w-full whitespace-normal rounded-2xl border-accent/30 bg-background/70 p-6 text-center shadow-sm hover:bg-accent/10"
            >
              <Link href="/auth/teacher/login" className="flex flex-col items-center justify-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <UserRoundCog className="h-8 w-8 text-accent" />
                </span>
                <span>
                  <span className="block text-xl font-semibold">Teacher Login</span>
                  <span className="mt-2 block text-sm leading-relaxed font-normal text-muted-foreground">
                    Manage lessons, students, and your dashboard.
                  </span>
                </span>
              </Link>
            </Button>
          </div>
          <div className="pt-2 text-center text-sm">
            <Link
              href="/auth/admin/login"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ShieldCheck className="h-4 w-4" />
              Administrator Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
