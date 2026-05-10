import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { RoleLoginForm } from "@/components/auth/role-login-form"

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams

  return (
    <AuthShell>
      <RoleLoginForm
        role="student"
        title="Student Login"
        description="Sign in to access your student portal."
        message={params.message}
        accountLink={
          <>
            <span className="text-muted-foreground">Need an account? </span>
            <Link href="/auth/sign-up" className="text-foreground underline underline-offset-4">
              Create one
            </Link>
            <span className="text-muted-foreground"> or </span>
            <Link href="/inquire" className="text-foreground underline underline-offset-4">
              inquire about lessons
            </Link>
          </>
        }
      />
    </AuthShell>
  )
}
