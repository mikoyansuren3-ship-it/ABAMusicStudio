"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Loader2, Mail } from "lucide-react"
import type { Invoice, Profile, Student } from "@/lib/types"
import { markAsPaid, sendInvoiceEmail } from "@/app/admin/money/actions"
import { AdminCard, EmptyState, Eyebrow } from "@/components/admin/ui"
import { CreateInvoiceButton, type InvoiceStudentOption } from "@/components/admin/create-invoice-dialog"
import { formatCurrency, formatMediumDate } from "@/lib/portal/format"

export type InvoiceRow = Invoice & { student: (Student & { profile: Profile | null }) | null }

interface InvoicesListProps {
  invoices: InvoiceRow[]
  students: InvoiceStudentOption[]
  nowMs: number
}

function isOverdue(invoice: InvoiceRow, nowMs: number) {
  return invoice.status === "unpaid" && !!invoice.due_date && new Date(`${invoice.due_date}T23:59:59`).getTime() < nowMs
}

function studentLabel(invoice: InvoiceRow) {
  return invoice.student?.name || invoice.student?.profile?.full_name || "Student"
}

export function InvoicesList({ invoices, students, nowMs }: InvoicesListProps) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [sentNotice, setSentNotice] = useState<string | null>(null)

  const unpaid = invoices.filter((invoice) => invoice.status === "unpaid")
  const history = invoices.filter((invoice) => invoice.status !== "unpaid")

  async function handleMarkPaid(invoiceId: string, method: "cash" | "check") {
    setPendingId(invoiceId)
    setActionError(null)
    const result = await markAsPaid(invoiceId, method)
    if (result?.error) setActionError(result.error)
    router.refresh()
    setPendingId(null)
  }

  async function handleSendEmail(invoice: InvoiceRow) {
    setSendingId(invoice.id)
    setActionError(null)
    setSentNotice(null)
    const result = await sendInvoiceEmail(invoice.id)
    if (result?.error) setActionError(result.error)
    else if ("sentTo" in result) setSentNotice(`Invoice for ${studentLabel(invoice)} emailed to ${result.sentTo}.`)
    router.refresh()
    setSendingId(null)
  }

  function StatusBadge({ invoice }: { invoice: InvoiceRow }) {
    if (invoice.status === "paid") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-green-600 px-2 py-[3px] text-[11px] font-semibold text-green-600">
          <CheckCircle2 className="size-3" aria-hidden />
          Paid
        </span>
      )
    }
    if (isOverdue(invoice, nowMs)) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-destructive px-2 py-[3px] text-[11px] font-semibold text-destructive">
          <Clock className="size-3" aria-hidden />
          Overdue
        </span>
      )
    }
    if (invoice.status === "cancelled") {
      return (
        <span className="inline-flex items-center rounded-md border px-2 py-[3px] text-[11px] font-semibold text-muted-foreground">
          Cancelled
        </span>
      )
    }
    return (
      <span className="inline-flex items-center rounded-md border px-2 py-[3px] text-[11px] font-semibold text-muted-foreground">
        Unpaid
      </span>
    )
  }

  if (invoices.length === 0) {
    return (
      <AdminCard className="p-0">
        <EmptyState
          title="No invoices yet"
          cta={<CreateInvoiceButton students={students} variant="dashed" label="Create the first invoice" />}
        >
          Give a student a rate and a weekly slot and the month&apos;s lessons — and what they add up to — appear on
          the Income tab. Invoices you create or mark as paid in cash land here.
        </EmptyState>
      </AdminCard>
    )
  }

  return (
    <>
      {actionError && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {actionError}
        </p>
      )}
      {sentNotice && (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {sentNotice}
        </p>
      )}

      {unpaid.length > 0 && (
        <AdminCard className="flex flex-col pb-6">
          <Eyebrow className="mb-1.5">Awaiting payment</Eyebrow>
          {unpaid.map((invoice, index) => (
            <div
              key={invoice.id}
              className={`flex flex-wrap items-center gap-4 py-4 ${index < unpaid.length - 1 ? "border-b" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{studentLabel(invoice)}</p>
                <p className="truncate text-[13px] text-muted-foreground">{invoice.description || "Invoice"}</p>
                <p className={`text-xs ${isOverdue(invoice, nowMs) ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                  {invoice.due_date
                    ? `${isOverdue(invoice, nowMs) ? "Was due" : "Due"} ${formatMediumDate(invoice.due_date)}`
                    : "Due upon receipt"}
                  {invoice.sent_at ? ` · emailed ${formatMediumDate(invoice.sent_at)}` : " · not emailed yet"}
                </p>
              </div>
              <p className="shrink-0 font-serif text-xl font-semibold">{formatCurrency(invoice.amount)}</p>
              <div className="flex flex-wrap items-center gap-2">
                {pendingId === invoice.id ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Saving" />
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 gap-1.5 rounded-lg"
                      disabled={sendingId === invoice.id}
                      onClick={() => handleSendEmail(invoice)}
                    >
                      {sendingId === invoice.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <Mail className="size-3.5" aria-hidden />
                          {invoice.sent_at ? "Resend" : "Email invoice"}
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-lg"
                      onClick={() => handleMarkPaid(invoice.id, "cash")}
                    >
                      Paid in cash
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-lg"
                      onClick={() => handleMarkPaid(invoice.id, "check")}
                    >
                      Paid by check
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </AdminCard>
      )}

      {history.length > 0 && (
        <AdminCard className="flex flex-col pb-6">
          <Eyebrow className="mb-1.5">History</Eyebrow>
          {history.map((invoice, index) => (
            <div
              key={invoice.id}
              className={`flex flex-wrap items-center gap-4 py-3.5 ${index < history.length - 1 ? "border-b" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium">{studentLabel(invoice)}</p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {invoice.description || "Invoice"} · {formatMediumDate(invoice.created_at)}
                  {invoice.status === "paid" && invoice.payment_method ? ` · ${invoice.payment_method}` : ""}
                  {invoice.sent_at ? ` · emailed ${formatMediumDate(invoice.sent_at)}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">{formatCurrency(invoice.amount)}</p>
              <StatusBadge invoice={invoice} />
            </div>
          ))}
        </AdminCard>
      )}
    </>
  )
}
