import { GrandStaffLogin } from "@/components/auth/grand-staff-login"
import { LoginWoodBackground } from "@/components/auth/login-wood-background"

export default function LoginPage() {
  return (
    <LoginWoodBackground className="max-w-none" logoSubtitle="Student & Teacher Portal">
      <GrandStaffLogin />
    </LoginWoodBackground>
  )
}
