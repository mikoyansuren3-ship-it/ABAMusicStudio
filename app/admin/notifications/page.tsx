import { redirect } from "next/navigation"

/** Notifications renamed to Announcements (Stage & Parchment redesign). */
export default function AdminNotificationsRedirect() {
  redirect("/admin/announcements")
}
