import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PaymentsView } from "@/components/payments-view"

export default async function PaymentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/student/login")

  const { data: student } = await supabase.from("students").select("*").eq("parent_id", user.id).maybeSingle()

  const { data: invoices } = student
    ? await supabase.from("invoices").select("*").eq("student_id", student.id).order("created_at", { ascending: false })
    : { data: [] }

  return <PaymentsView invoices={invoices || []} studentId={student?.id} />
}
