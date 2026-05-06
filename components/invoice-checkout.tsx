"use client"

import { useCallback, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createCheckoutSession } from "@/app/actions/stripe"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface InvoiceCheckoutProps {
  invoiceId: string
  amount: number
  description: string
  studentName: string
}

export function InvoiceCheckout({ invoiceId, amount, description, studentName }: InvoiceCheckoutProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  const fetchClientSecret = useCallback(() => {
    return createCheckoutSession(invoiceId)
  }, [invoiceId])

  const handleComplete = async () => {
    setProcessing(true)
    // Give Stripe a moment to process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setPaymentComplete(true)
    setProcessing(false)
    // Redirect after showing success
    setTimeout(() => {
      router.push("/portal/payments")
      router.refresh()
    }, 2000)
  }

  if (paymentComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold">Payment Successful!</h2>
        <p className="mt-2 text-muted-foreground">Thank you for your payment. Redirecting...</p>
      </div>
    )
  }

  if (!showCheckout) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Invoice Details</h3>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student</span>
              <span className="font-medium">{studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description</span>
              <span className="font-medium">{description}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Amount Due</span>
              <span className="text-xl font-bold">${amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <Button className="w-full" size="lg" onClick={() => setShowCheckout(true)}>
          Pay Now
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div id="checkout" className="rounded-lg border bg-white">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            fetchClientSecret,
            onComplete: handleComplete,
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
      {processing && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing payment...</span>
        </div>
      )}
    </div>
  )
}
