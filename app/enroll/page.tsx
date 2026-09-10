import type { Metadata } from "next"

import { EnrollmentForm } from "@/app/enroll/enrollment-form"

export const metadata: Metadata = {
  title: "Enroll",
  description: "Request enrollment in piano lessons at ABA Music Academy — our team will follow up to confirm details.",
  // Transactional request step — keep out of search results.
  robots: { index: false, follow: false },
}

export default function EnrollPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl font-bold">Enroll in Piano Lessons</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose your lesson plan and send us your enrollment request. We&apos;ll call or email you to confirm
            details and get the first lesson scheduled.
          </p>
        </div>

        <div className="mt-12">
          <EnrollmentForm />
        </div>
      </div>
    </div>
  )
}

