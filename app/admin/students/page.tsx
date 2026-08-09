import { createClient } from "@/lib/supabase/server"
import { StudentsView } from "@/components/admin/students-view"
import type { PanelStudent } from "@/components/admin/student-panel"

export default async function StudentsPage() {
  const supabase = await createClient()

  const [{ data: studentsData }, { data: teachers }] = await Promise.all([
    supabase
      .from("students")
      .select("*, profile:profiles(*), billing:student_billing(*), slots:student_slots(*)")
      .order("name"),
    supabase.from("teachers").select("*").order("sort_order").order("name"),
  ])

  const students: PanelStudent[] = (studentsData || []).map((student) => ({
    ...student,
    billing: Array.isArray(student.billing) ? (student.billing[0] ?? null) : (student.billing ?? null),
    slots: student.slots || [],
  }))

  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <StudentsView students={students} teachers={teachers || []} />
    </div>
  )
}
