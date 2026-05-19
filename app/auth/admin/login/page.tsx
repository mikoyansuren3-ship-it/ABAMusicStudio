import { AuthShell } from "@/components/auth/auth-shell"
import { RoleLoginForm } from "@/components/auth/role-login-form"
import { getRememberedLoginEmail } from "@/lib/auth/remember-login"

export default async function AdminLoginPage() {
  const rememberedEmail = await getRememberedLoginEmail()

  return (
    <AuthShell>
      <RoleLoginForm
        role="admin"
        title="Administrator Login"
        description="Sign in with the owner account to manage the studio."
        defaultEmail={rememberedEmail}
        defaultRememberMe={Boolean(rememberedEmail)}
      />
    </AuthShell>
  )
}
