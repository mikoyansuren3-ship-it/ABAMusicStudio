import { createClient } from "@/lib/supabase/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AvailabilityManager } from "@/components/availability-manager"

export default async function AvailabilityPage() {
  const supabase = await createClient()

  const { data: availability } = await supabase.from("availability").select("*").order("day_of_week")

  const { data: exceptions } = await supabase
    .from("availability_exceptions")
    .select("*")
    .gte("exception_date", new Date().toISOString().split("T")[0])
    .order("exception_date")

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-lg font-semibold">Availability</h1>
        </div>
      </header>

      <div className="p-6">
        <AvailabilityManager availability={availability || []} exceptions={exceptions || []} />
      </div>
    </>
  )
}
