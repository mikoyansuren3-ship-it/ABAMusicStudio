import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { InvoiceCheckout } from "@/components/invoice-checkout"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { PortalCard, PortalPageBody, PortalPageHeader } from "@/components/portal/studio/portal-ui"
import { formatCurrency } from "@/lib/portal/format"

export default async function PayInvoicePage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/student/login")
  }

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      student:students(
        id,
        name,
        parent_id
      )
    `,
    )
    .eq("id", invoiceId)
    .single()

  if (error || !invoice) {
    notFound()
  }

  if (invoice.student?.parent_id !== user.id) {
    redirect("/portal/payments")
  }

  if (invoice.status === "paid") {
    return (
      <div className="flex min-h-full flex-col">
        <PortalPageHeader title="Payment Complete" subtitle="This invoice has already been settled." />
        <PortalPageBody className="max-w-lg">
          <PortalCard className="p-10 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-[#4A7A4A]" />
            <h2 className="mt-4 font-serif text-xl font-bold text-[#2b1b14]">Thank you!</h2>
            <p className="mt-2 text-sm text-[#8B7355]">This invoice has already been paid.</p>
            <Link
              href="/portal/payments"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3B2518] px-4 py-2 text-xs font-semibold text-[#F5EBD9] hover:bg-[#4E3425]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Payments
            </Link>
          </PortalCard>
        </PortalPageBody>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <PortalPageHeader title="Pay Invoice" subtitle="Complete your payment securely with Stripe." />
      <PortalPageBody className="max-w-lg">
        <Link
          href="/portal/payments"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#8a6b3c] hover:text-[#6f5630] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5E34]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </Link>

        <PortalCard className="mb-6 p-5">
          <p className="text-sm text-[#8B7355]">Amount due</p>
          <p className="mt-1 font-serif text-3xl font-bold text-[#C47A2C]">{formatCurrency(invoice.amount)}</p>
          <p className="mt-2 text-sm font-medium text-[#2b1b14]">{invoice.description || "Piano Lessons"}</p>
          <p className="text-xs text-[#8B7355]">Student: {invoice.student?.name || "Student"}</p>
        </PortalCard>

        <InvoiceCheckout
          invoiceId={invoice.id}
          amount={invoice.amount}
          description={invoice.description || "Piano Lessons"}
          studentName={invoice.student?.name || "Student"}
        />
      </PortalPageBody>
    </div>
  )
}
