"use client"

import Link from "next/link"
import type { Invoice } from "@/lib/types"
import { formatCurrency, formatMediumDate } from "@/lib/portal/format"
import {
  PortalButton,
  PortalCard,
  PortalEmptyState,
  PortalPageBody,
  PortalPageHeader,
  PortalStatusBadge,
  SectionDivider,
} from "@/components/portal/studio/portal-ui"

interface PaymentsViewProps {
  invoices: Invoice[]
  studentId?: string
}

export function PaymentsView({ invoices, studentId }: PaymentsViewProps) {
  const unpaidInvoices = invoices.filter((inv) => inv.status === "unpaid")
  const paidInvoices = invoices.filter((inv) => inv.status === "paid")
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  if (!studentId) {
    return (
      <div className="flex min-h-full flex-col">
        <PortalPageHeader title="Payments" subtitle="Invoices and payment history" />
        <PortalPageBody>
          <PortalCard className="p-8">
            <PortalEmptyState message="Complete your profile to view payment information." />
            <div className="mt-4 text-center">
              <Link
                href="/portal/profile"
                className="inline-flex rounded-lg bg-[#3B2518] px-4 py-2 text-xs font-semibold text-[#F5EBD9] hover:bg-[#4E3425]"
              >
                Complete Profile
              </Link>
            </div>
          </PortalCard>
        </PortalPageBody>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <PortalPageHeader title="Payments" subtitle="Invoices and payment history" />

      <PortalPageBody>
        <div className="relative mb-6 grid gap-4 md:grid-cols-3">
          <PortalCard className="p-5">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[#8B7355] uppercase">Current Balance</p>
            <p
              className={`mt-2.5 font-serif text-3xl font-bold ${totalUnpaid > 0 ? "text-[#C47A2C]" : "text-[#4A7A4A]"}`}
            >
              {formatCurrency(totalUnpaid)}
            </p>
            <p className="mt-1 text-xs text-[#8B7355]">
              {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? "s" : ""}
            </p>
          </PortalCard>

          <PortalCard className="p-5">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[#8B7355] uppercase">Total Paid</p>
            <p className="mt-2.5 font-serif text-3xl font-bold text-[#4A7A4A]">{formatCurrency(totalPaid)}</p>
            <p className="mt-1 text-xs text-[#8B7355]">Lifetime payments</p>
          </PortalCard>

          <PortalCard className="p-5">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[#8B7355] uppercase">Total Invoices</p>
            <p className="mt-2.5 font-serif text-3xl font-bold text-[#2b1b14]">{invoices.length}</p>
            <p className="mt-1 text-xs text-[#8B7355]">All time</p>
          </PortalCard>
        </div>

        {unpaidInvoices.length > 0 ? (
          <>
            <SectionDivider clef="treble" label="Outstanding" />
            <PortalCard className="mb-6 overflow-hidden border-[rgba(196,122,44,0.2)]">
              {unpaidInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col gap-3 border-b border-[rgba(78,52,37,0.08)] bg-[rgba(196,122,44,0.02)] px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#2b1b14]">{inv.description || "Invoice"}</p>
                    <p className="mt-1 text-xs text-[#8B7355]">
                      Due: {inv.due_date ? formatMediumDate(inv.due_date) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <span className="font-serif text-xl font-bold text-[#C47A2C]">{formatCurrency(inv.amount)}</span>
                    <Link href={`/portal/pay/${inv.id}`}>
                      <PortalButton variant="gold">Pay Now</PortalButton>
                    </Link>
                  </div>
                </div>
              ))}
            </PortalCard>
          </>
        ) : null}

        <SectionDivider clef="bass" label="Payment History" />

        <PortalCard className="overflow-hidden">
          {invoices.length > 0 ? (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className={`flex flex-col gap-2 border-b border-[rgba(78,52,37,0.08)] px-5 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between ${inv.status === "paid" ? "opacity-75" : ""}`}
              >
                <div>
                  <p className="text-[13px] font-semibold text-[#2b1b14]">{inv.description || "Invoice"}</p>
                  <p className="mt-0.5 text-[11.5px] text-[#7d6b58]">
                    Created {formatMediumDate(inv.created_at)}
                    {inv.paid_at ? ` · Paid ${formatMediumDate(inv.paid_at)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#2b1b14]">{formatCurrency(inv.amount)}</span>
                  <PortalStatusBadge status={inv.status} />
                </div>
              </div>
            ))
          ) : (
            <PortalEmptyState message="No invoices yet." />
          )}
        </PortalCard>
      </PortalPageBody>
    </div>
  )
}
