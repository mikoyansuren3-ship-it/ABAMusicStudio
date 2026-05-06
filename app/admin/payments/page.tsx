import { createClient } from "@/lib/supabase/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdminPaymentsView } from "@/components/admin-payments-view"

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, student:students(*, profile:profiles(*))")
    .order("created_at", { ascending: false })

  const { data: students } = await supabase.from("students").select("*, profile:profiles(*)").eq("is_active", true)

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
        <AdminPaymentsView invoices={invoices || []} students={students || []} />
      </div>
    </>
  )
}
