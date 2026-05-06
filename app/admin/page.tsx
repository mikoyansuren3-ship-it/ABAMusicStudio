import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, CreditCard, UserPlus, Users, Clock, ArrowRight } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Today's bookings
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: todaysBookings } = await supabase
    .from("bookings")
    .select("*, student:students(*, profile:profiles(*))")
    .gte("start_time", today.toISOString())
    .lt("start_time", tomorrow.toISOString())
    .in("status", ["confirmed", "pending"])
    .order("start_time")

  // Pending inquiries
  const { data: pendingInquiries } = await supabase
    .from("inquiries")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5)

  // Unpaid invoices
  const { data: unpaidInvoices } = await supabase
    .from("invoices")
    .select("*, student:students(*, profile:profiles(*))")
    .eq("status", "unpaid")
    .order("due_date")
    .limit(5)

  // Active students count
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const totalUnpaid = unpaidInvoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold">Welcome back!</h2>
          <p className="mt-1 text-muted-foreground">Here&apos;s what&apos;s happening at the studio today.</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Lessons</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{todaysBookings?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingInquiries?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unpaid Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${totalUnpaid > 0 ? "text-destructive" : ""}`}>
                ${(totalUnpaid / 100).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">{unpaidInvoices?.length || 0} invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{studentCount || 0}</p>
              <p className="text-sm text-muted-foreground">Currently enrolled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <CardDescription>
                {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysBookings && todaysBookings.length > 0 ? (
                <div className="space-y-3">
                  {todaysBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                          <Clock className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.student?.profile?.full_name || "Student"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.start_time).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(booking.end_time).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>{booking.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No lessons scheduled for today</div>
              )}
              <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                <Link href="/admin/schedule">
                  View Full Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Inquiries */}
          <Card>
            <CardHeader>
              <CardTitle>New Student Inquiries</CardTitle>
              <CardDescription>Pending requests to review</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInquiries && pendingInquiries.length > 0 ? (
                <div className="space-y-3">
                  {pendingInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{inquiry.name}</p>
                        <Badge variant="secondary">{inquiry.experience_level || "New"}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{inquiry.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date(inquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No pending inquiries</div>
              )}
              <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                <Link href="/admin/inquiries">
                  Manage Inquiries
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
