import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { InvoiceCheckout } from "@/components/invoice-checkout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

export default async function PayInvoicePage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/student/login")
  }

  // Get the invoice
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
    `
    )
    .eq("id", invoiceId)
    .single()

  if (error || !invoice) {
    notFound()
  }

  // Verify the user owns this invoice (is the parent of the student)
  if (invoice.student?.parent_id !== user.id) {
    redirect("/portal/payments")
  }

  // If already paid, show success message
  if (invoice.status === "paid") {
    return (
      <div className="container mx-auto max-w-lg px-4 py-12">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold">Invoice Already Paid</h1>
          <p className="mt-2 text-muted-foreground">This invoice has already been paid. Thank you!</p>
          <Button asChild className="mt-6">
            <Link href="/portal/payments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payments
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/portal/payments">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Link>
      </Button>

      <h1 className="text-2xl font-bold">Pay Invoice</h1>
      <p className="mt-2 text-muted-foreground">Complete your payment securely with Stripe.</p>

      <div className="mt-8">
        <InvoiceCheckout
          invoiceId={invoice.id}
          amount={invoice.amount}
          description={invoice.description || "Piano Lessons"}
          studentName={invoice.student?.name || "Student"}
        />
      </div>
    </div>
  )
}
