import Stripe from "stripe"
import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { stripe } from "@/lib/stripe"

export const metadata: Metadata = {
  title: "Enrollment Complete | ABA Music Academy",
  description: "Your ABA Music Academy enrollment payment confirmation.",
}

function getStripeId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null
}

export default async function EnrollSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams

  if (!sessionId) {
    return (
      <div className="py-16 md:py-24">
        <div className="container mx-auto max-w-xl px-4">
          <Card>
            <CardHeader>
              <CardTitle>Checkout Session Missing</CardTitle>
              <CardDescription>We could not find a Stripe checkout session to confirm.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/enroll">Return to Enrollment</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const session: Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(sessionId)
  const isPaid = session.payment_status === "paid"

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader>
            <CardTitle>{isPaid ? "Enrollment Confirmed" : "Payment Not Confirmed Yet"}</CardTitle>
            <CardDescription>
              {isPaid
                ? "Thank you for enrolling with ABA Music Academy."
                : "Stripe has not marked this checkout session as paid yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isPaid ? (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  We&apos;ll email you within 24 hours to schedule your first lesson and confirm your recurring monthly
                  tuition details.
                </p>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p>
                    <strong className="text-foreground">Student:</strong> {session.metadata?.studentName || "Not provided"}
                  </p>
                  <p>
                    <strong className="text-foreground">Customer ID:</strong> {getStripeId(session.customer) || "Pending"}
                  </p>
                  <p>
                    <strong className="text-foreground">Subscription ID:</strong>{" "}
                    {getStripeId(session.subscription) || "Pending"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                If you completed payment, please wait a moment and refresh this page. Otherwise, you can return to
                enrollment and try again.
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
              {!isPaid && (
                <Button variant="outline" asChild>
                  <Link href="/enroll">Return to Enrollment</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

