import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, CreditCard, Clock, Bell, ArrowRight } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default async function PortalDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/student/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: student } = await supabase.from("students").select("*").eq("parent_id", user.id).maybeSingle()

  // Fetch upcoming bookings
  const { data: bookings } = student
    ? await supabase
        .from("bookings")
        .select("*")
        .eq("student_id", student.id)
        .gte("start_time", new Date().toISOString())
        .in("status", ["confirmed", "pending"])
        .order("start_time")
        .limit(3)
    : { data: [] }

  // Fetch unpaid invoices
  const { data: invoices } = student
    ? await supabase
        .from("invoices")
        .select("*")
        .eq("student_id", student.id)
        .eq("status", "unpaid")
        .order("due_date")
        .limit(3)
    : { data: [] }

  // Fetch unread notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .or(`audience.eq.all,recipient_ids.cs.{${user.id}}`)
    .not("is_read_by", "cs", `{${user.id}}`)
    .order("created_at", { ascending: false })
    .limit(3)

  const nextLesson = bookings?.[0]
  const unpaidBalance = invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Student"}!
          </h2>
          <p className="mt-1 text-muted-foreground">Here&apos;s an overview of your lessons and account.</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next Lesson</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {nextLesson ? (
                <>
                  <p className="text-2xl font-bold">
                    {new Date(nextLesson.start_time).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(nextLesson.start_time).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">No upcoming lessons</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${unpaidBalance > 0 ? "text-destructive" : ""}`}>
                ${(unpaidBalance / 100).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {invoices?.length || 0} unpaid invoice{invoices?.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{notifications?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Lessons</CardTitle>
              <CardDescription>Your next scheduled lessons</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                          <Clock className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {new Date(booking.start_time).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
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
                <p className="text-center text-muted-foreground py-8">No upcoming lessons scheduled</p>
              )}
              <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                <Link href="/portal/schedule">
                  View Full Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Messages from your studio</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="rounded-lg border p-3">
                      <p className="font-medium">{notification.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{notification.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No new notifications</p>
              )}
              <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                <Link href="/portal/notifications">
                  View All Notifications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Setup prompt for new students */}
        {!student && (
          <Card className="border-accent">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Your account is set up, but we need a few more details to get you started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/portal/profile">Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
