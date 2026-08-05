import { createClient } from "@/lib/supabase/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { StudentsManager } from "@/components/students-manager"

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: studentsData } = await supabase
    .from("students")
    .select("*, profile:profiles(*), billing:student_billing(*)")
    .order("created_at", { ascending: false })

  const students = (studentsData || []).map((s) => ({
    ...s,
    billing: Array.isArray(s.billing) ? (s.billing[0] ?? null) : (s.billing ?? null),
  }))

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-lg font-semibold">Students</h1>
        </div>
      </header>

      <div className="p-6">
        <StudentsManager students={students} />
      </div>
    </>
  )
}
