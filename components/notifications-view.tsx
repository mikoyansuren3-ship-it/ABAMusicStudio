"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check } from "lucide-react"
import type { Notification } from "@/lib/types"
import { markNotificationAsRead, markAllAsRead } from "@/app/portal/notifications/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface NotificationsViewProps {
  notifications: Notification[]
  userId: string
}

export function NotificationsView({ notifications, userId }: NotificationsViewProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const unreadNotifications = notifications.filter((n) => !n.is_read_by?.includes(userId))
  const readNotifications = notifications.filter((n) => n.is_read_by?.includes(userId))

  async function handleMarkAsRead(notificationId: string) {
    setLoadingId(notificationId)
    await markNotificationAsRead(notificationId, userId)
    router.refresh()
    setLoadingId(null)
  }

  async function handleMarkAllAsRead() {
    setLoadingId("all")
    await markAllAsRead(
      unreadNotifications.map((n) => n.id),
      userId,
    )
    router.refresh()
    setLoadingId(null)
  }

  return (
    <div className="space-y-8">
      {/* Unread Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                New Notifications
                {unreadNotifications.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Messages from ABA Music Studio</CardDescription>
            </div>
            {unreadNotifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={loadingId === "all"}>
                <Check className="mr-1 h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {unreadNotifications.length > 0 ? (
            <div className="space-y-3">
              {unreadNotifications.map((notification) => (
                <div key={notification.id} className="rounded-lg border bg-accent/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{notification.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={loadingId === notification.id}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No new notifications</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {readNotifications.map((notification) => (
                <div key={notification.id} className="rounded-lg border p-3 opacity-75">
                  <p className="font-medium">{notification.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{notification.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
