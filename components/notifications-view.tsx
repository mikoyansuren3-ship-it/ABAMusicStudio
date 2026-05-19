"use client"

import { Check, Loader2 } from "lucide-react"
import type { Notification } from "@/lib/types"
import { markNotificationAsRead, markAllAsRead } from "@/app/portal/notifications/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  PortalButton,
  PortalCard,
  PortalEmptyState,
  PortalPageBody,
  PortalPageHeader,
  SectionDivider,
} from "@/components/portal/studio/portal-ui"

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
    <div className="flex min-h-full flex-col">
      <PortalPageHeader
        title="Notifications"
        subtitle="Messages from ABA Music Academy"
        right={
          unreadNotifications.length > 0 ? (
            <PortalButton variant="outline" onClick={handleMarkAllAsRead} disabled={loadingId === "all"}>
              {loadingId === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Mark All Read
            </PortalButton>
          ) : null
        }
      />

      <PortalPageBody>
        {unreadNotifications.length > 0 ? (
          <>
            <SectionDivider clef="treble" label={`New (${unreadNotifications.length})`} />
            <PortalCard className="mb-6 overflow-hidden">
              {unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="group border-b border-[rgba(78,52,37,0.08)] bg-[rgba(201,169,110,0.015)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[rgba(201,169,110,0.03)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A96E]" />
                        <span className="text-sm font-semibold text-[#2b1b14]">{notification.title}</span>
                      </div>
                      <p className="ml-3.5 text-[13px] leading-relaxed whitespace-pre-wrap text-[#8B7355]">
                        {notification.body}
                      </p>
                      <span className="mt-1.5 ml-3.5 block text-[11px] text-[#B8A89A]">
                        {new Date(notification.created_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <PortalButton
                      variant="ghost"
                      className="hidden shrink-0 px-2.5 py-1 group-hover:inline-flex"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={loadingId === notification.id}
                    >
                      {loadingId === notification.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Read
                    </PortalButton>
                  </div>
                </div>
              ))}
            </PortalCard>
          </>
        ) : (
          <PortalEmptyState message="All caught up — no new notifications." />
        )}

        {readNotifications.length > 0 ? (
          <>
            <SectionDivider clef="bass" label="Previous" />
            <PortalCard className="overflow-hidden">
              {readNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border-b border-[rgba(78,52,37,0.08)] px-5 py-3.5 opacity-65 last:border-b-0"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-[#2b1b14]">{notification.title}</span>
                    <span className="text-[11px] text-[#B8A89A]">
                      {new Date(notification.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#8B7355]">{notification.body}</p>
                </div>
              ))}
            </PortalCard>
          </>
        ) : null}
      </PortalPageBody>
    </div>
  )
}
