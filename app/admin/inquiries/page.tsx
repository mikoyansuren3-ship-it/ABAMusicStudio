import { createClient } from "@/lib/supabase/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { InquiriesManager } from "@/components/inquiries-manager"

export default async function InquiriesPage() {
  const supabase = await createClient()

  const { data: inquiries } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false })

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-lg font-semibold">Student Inquiries</h1>
        </div>
      </header>

      <div className="p-6">
        <InquiriesManager inquiries={inquiries || []} />
      </div>
    </>
  )
}
