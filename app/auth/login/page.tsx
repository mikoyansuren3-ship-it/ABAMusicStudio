import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { GraduationCap, ShieldCheck, UserRoundCog } from "lucide-react"

export default function LoginPage() {
  return (
    <AuthShell>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Login</CardTitle>
          <CardDescription>Select the portal that matches your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild variant="outline" className="h-auto w-full justify-start p-5 text-left">
            <Link href="/auth/student/login">
              <GraduationCap className="h-8 w-8 text-accent" />
              <span>
                <span className="block font-semibold">Student Login</span>
                <span className="block text-sm font-normal text-muted-foreground">Access schedules, payments, and profile details.</span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto w-full justify-start p-5 text-left">
            <Link href="/auth/teacher/login">
              <UserRoundCog className="h-8 w-8 text-accent" />
              <span>
                <span className="block font-semibold">Teacher Login</span>
                <span className="block text-sm font-normal text-muted-foreground">Manage lessons, students, and your dashboard.</span>
              </span>
            </Link>
          </Button>
          <div className="pt-2 text-center text-sm">
            <Link href="/auth/admin/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ShieldCheck className="h-4 w-4" />
              Administrator Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
