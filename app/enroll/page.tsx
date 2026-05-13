import type { Metadata } from "next"

import { EnrollmentForm } from "@/app/enroll/enrollment-form"

export const metadata: Metadata = {
  title: "Enroll | ABA Music Academy",
  description: "Enroll in recurring monthly piano lesson tuition at ABA Music Academy.",
}

export default function EnrollPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl font-bold">Enroll in Piano Lessons</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose your lesson plan, add the one-time registration fee, and continue to secure Stripe Checkout.
          </p>
        </div>

        <div className="mt-12">
          <EnrollmentForm />
        </div>
      </div>
    </div>
  )
}

