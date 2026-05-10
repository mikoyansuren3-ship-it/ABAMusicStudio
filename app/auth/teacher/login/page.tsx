import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { RoleLoginForm } from "@/components/auth/role-login-form"

export default function TeacherLoginPage() {
  return (
    <AuthShell>
      <RoleLoginForm
        role="teacher"
        title="Teacher Login"
        description="Sign in to manage lessons and students."
        accountLink={
          <>
            <span className="text-muted-foreground">Need a teacher account? </span>
            <Link href="/auth/teacher/sign-up" className="text-foreground underline underline-offset-4">
              Create one
            </Link>
          </>
        }
      />
    </AuthShell>
  )
}
