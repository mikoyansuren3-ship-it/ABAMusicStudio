import { AuthShell } from "@/components/auth/auth-shell"
import { RoleLoginForm } from "@/components/auth/role-login-form"

export default function AdminLoginPage() {
  return (
    <AuthShell>
      <RoleLoginForm
        role="admin"
        title="Administrator Login"
        description="Sign in with the owner account to manage the studio."
      />
    </AuthShell>
  )
}
