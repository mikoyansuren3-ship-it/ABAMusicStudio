import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { PaymentsView } from "@/components/payments-view"

export default async function PaymentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/student/login")

  const { data: student } = await supabase.from("students").select("*").eq("profile_id", user.id).single()

  // Fetch invoices for this student
  const { data: invoices } = student
    ? await supabase.from("invoices").select("*").eq("student_id", student.id).order("created_at", { ascending: false })
    : { data: [] }

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-lg font-semibold">Payments</h1>
        </div>
      </header>

      <div className="p-6">
        <PaymentsView invoices={invoices || []} studentId={student?.id} />
      </div>
    </>
  )
}
