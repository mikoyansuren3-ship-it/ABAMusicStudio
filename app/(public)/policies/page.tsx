import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PageHeader } from "@/components/public/page-header"
import { AlertCircle, Clock, CreditCard, Calendar } from "lucide-react"

export const metadata = {
  title: "Studio Policies | ABA Music Academy",
  description: "View cancellation, payment, and studio policies at ABA Music Academy.",
}

export default function PoliciesPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <PageHeader
          title="Studio Policies"
          lede="Please review our policies to ensure a smooth experience for everyone."
        />

        {/* Policies */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 font-semibold leading-none">
                <AlertCircle className="h-5 w-5 text-accent" aria-hidden />
                Cancellation Policy
              </h2>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">24-Hour Notice:</strong> Lessons cancelled with at least 24 hours
                notice can be rescheduled at no charge, subject to availability.
              </p>
              <p>
                <strong className="text-foreground">Late Cancellations:</strong> Lessons cancelled with less than 24
                hours notice will be charged 30% of the lesson cost. This includes no-shows.
              </p>
              <p>
                <strong className="text-foreground">Emergencies:</strong> In case of genuine emergencies (illness,
                family emergency), please contact me as soon as possible. These situations will be handled on a
                case-by-case basis.
              </p>
              <p>
                <strong className="text-foreground">Teacher Cancellations:</strong> If I need to cancel a lesson, you
                will be offered a makeup lesson or credit toward a future lesson.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 font-semibold leading-none">
                <Clock className="h-5 w-5 text-accent" aria-hidden />
                Late Arrival Policy
              </h2>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Grace Period:</strong> A 5-minute grace period is allowed. Please
                arrive on time to maximize your lesson.
              </p>
              <p>
                <strong className="text-foreground">Shortened Lessons:</strong> Students arriving more than 5 minutes
                late may have their lesson shortened to avoid impacting the next student.
              </p>
              <p>
                <strong className="text-foreground">15+ Minutes Late:</strong> Students arriving more than 15 minutes
                late may be considered a no-show and the full lesson fee will apply.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 font-semibold leading-none">
                <CreditCard className="h-5 w-5 text-accent" aria-hidden />
                Payment Policy
              </h2>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Payment Timing:</strong> Lesson payments are billed monthly and must
                be paid by the end of the first week of each month.
              </p>
              <p>
                <strong className="text-foreground">Accepted Methods:</strong> Credit/debit cards (processed securely
                through Stripe), cash, or check.
              </p>
              <p>
                <strong className="text-foreground">Late Payments:</strong> Each additional week after the first week
                will be charged an extra 10%. Lessons may be suspended until the balance is cleared.
              </p>
              <p>
                <strong className="text-foreground">Refunds:</strong> Prepaid lessons are non-refundable but may be
                transferred to another family member with prior approval.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 font-semibold leading-none">
                <Calendar className="h-5 w-5 text-accent" aria-hidden />
                Scheduling & Holidays
              </h2>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Regular Schedule:</strong> Once enrolled, students are expected to
                attend their regular weekly time slot. Consistent attendance leads to the best progress.
              </p>
              <p>
                <strong className="text-foreground">Makeup Lessons:</strong> When cancelled with proper notice, makeup
                lessons will be scheduled based on availability. Makeups must be used within 30 days.
              </p>
              <p>
                <strong className="text-foreground">Holiday Closures:</strong> The studio is closed for major holidays
                (New Year&apos;s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, Christmas). Monthly
                tuition rates account for these closures.
              </p>
              <p>
                <strong className="text-foreground">Vacation:</strong> Please provide 2 weeks notice for extended
                absences. Monthly tuition students may request a tuition pause for absences of 2+ weeks.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Notes */}
        <div className="mt-16 rounded-xl border bg-muted/30 p-8">
          <h2 className="font-serif text-2xl font-bold">Additional Notes</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground marker:text-accent">
            <li>
              <strong className="text-foreground">Practice:</strong> Regular practice between lessons is essential for
              progress. Students are expected to practice the assigned material each week.
            </li>
            <li>
              <strong className="text-foreground">Materials:</strong> Students are responsible for purchasing their
              own music books and materials as needed. Recommendations will be provided.
            </li>
            <li>
              <strong className="text-foreground">Communication:</strong> Please use the student portal for scheduling
              changes. For urgent matters, call or text directly.
            </li>
            <li>
              <strong className="text-foreground">Parent Involvement:</strong> For young students, a parent or
              guardian should be available during lessons and assist with home practice.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
