import { redirect } from "next/navigation"

/** Payments merged into the Money page (Stage & Parchment redesign). */
export default function AdminPaymentsRedirect() {
  redirect("/admin/money?tab=invoices")
}
