import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, CreditCard, Calendar } from "lucide-react"

export const metadata = {
  title: "Studio Policies | ABA Music Studio",
  description: "View cancellation, payment, and studio policies at ABA Music Studio.",
}

export default function PoliciesPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl font-bold">Studio Policies</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Please review our policies to ensure a smooth experience for everyone.
          </p>
        </div>

        {/* Policies */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                Cancellation Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">24-Hour Notice:</strong> Lessons cancelled with at least 24 hours
                notice can be rescheduled at no charge, subject to availability.
              </p>
              <p>
                <strong className="text-foreground">Late Cancellations:</strong> Lessons cancelled with less than 24
                hours notice will be charged in full. This includes no-shows.
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
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Late Arrival Policy
              </CardTitle>
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
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" />
                Payment Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Payment Timing:</strong> For pay-as-you-go lessons, payment is due
                at the time of the lesson. For monthly tuition, payment is due on the 1st of each month.
              </p>
              <p>
                <strong className="text-foreground">Accepted Methods:</strong> Credit/debit cards (processed securely
                through Stripe), cash, or check.
              </p>
              <p>
                <strong className="text-foreground">Late Payments:</strong> A $10 late fee may be applied to payments
                more than 7 days overdue. Lessons may be suspended until the balance is cleared.
              </p>
              <p>
                <strong className="text-foreground">Refunds:</strong> Prepaid lessons are non-refundable but may be
                transferred to another family member with prior approval.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Scheduling & Holidays
              </CardTitle>
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
        <div className="mt-16 rounded-lg border bg-muted/30 p-8">
          <h2 className="font-serif text-xl font-bold">Additional Notes</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong className="text-foreground">Practice:</strong> Regular practice between lessons is essential for
              progress. Students are expected to practice the assigned material each week.
            </li>
            <li>
              • <strong className="text-foreground">Materials:</strong> Students are responsible for purchasing their
              own music books and materials as needed. Recommendations will be provided.
            </li>
            <li>
              • <strong className="text-foreground">Communication:</strong> Please use the student portal for scheduling
              changes. For urgent matters, call or text directly.
            </li>
            <li>
              • <strong className="text-foreground">Parent Involvement:</strong> For young students, a parent or
              guardian should be available during lessons and assist with home practice.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
