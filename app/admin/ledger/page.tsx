import { redirect } from "next/navigation"

/** The income ledger merged into the Money page (Stage & Parchment redesign). */
export default function AdminLedgerRedirect() {
  redirect("/admin/money?tab=income")
}
