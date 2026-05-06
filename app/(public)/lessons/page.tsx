import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Check, Clock } from "lucide-react"

export const metadata = {
  title: "Lessons & Pricing | ABA Music Studio",
  description: "View lesson types, durations, and pricing at ABA Music Studio.",
}

const lessonTypes = [
  {
    duration: "30 min",
    price: 45,
    recommended: "Young beginners (ages 5-8)",
    features: ["Focused instruction", "Age-appropriate pacing", "Foundation building"],
  },
  {
    duration: "45 min",
    price: 60,
    recommended: "Most students",
    popular: true,
    features: ["Comprehensive lessons", "Technique & repertoire", "Theory integration"],
  },
  {
    duration: "60 min",
    price: 75,
    recommended: "Advanced students & adults",
    features: ["In-depth study", "Performance preparation", "Extended practice guidance"],
  },
]

export default function LessonsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl font-bold">Lessons & Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the lesson format that best fits your needs and goals.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {lessonTypes.map((lesson) => (
            <Card key={lesson.duration} className={lesson.popular ? "border-accent shadow-lg" : ""}>
              <CardHeader>
                {lesson.popular && <Badge className="mb-2 w-fit bg-accent text-accent-foreground">Most Popular</Badge>}
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  {lesson.duration}
                </CardTitle>
                <CardDescription>{lesson.recommended}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${lesson.price}</span>
                  <span className="text-muted-foreground">/lesson</span>
                </div>
                <ul className="space-y-3">
                  {lesson.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trial Lesson */}
        <div className="mt-16 rounded-lg border bg-muted/30 p-8 text-center md:p-12">
          <h2 className="font-serif text-2xl font-bold">Trial Lesson</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Not sure where to start? Book a 30-minute trial lesson for just $25. Meet your teacher, assess your current
            level, and discuss your musical goals.
          </p>
          <div className="mt-6">
            <span className="text-3xl font-bold">$25</span>
            <span className="text-muted-foreground"> for 30 minutes</span>
          </div>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/inquire">Book a Trial Lesson</Link>
          </Button>
        </div>

        {/* Monthly Subscription */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-2xl font-bold">Monthly Tuition Option</h2>
            <p className="mt-4 text-muted-foreground">
              For consistent scheduling and simplified billing, consider our monthly tuition plan. Pay once per month
              for 4 weekly lessons at a slight discount.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <h3 className="font-semibold">30 min / week</h3>
                <p className="mt-2">
                  <span className="text-2xl font-bold">$170</span>
                  <span className="text-muted-foreground">/month</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Save $10/month</p>
              </CardContent>
            </Card>

            <Card className="border-accent">
              <CardContent className="pt-6 text-center">
                <h3 className="font-semibold">45 min / week</h3>
                <p className="mt-2">
                  <span className="text-2xl font-bold">$225</span>
                  <span className="text-muted-foreground">/month</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Save $15/month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <h3 className="font-semibold">60 min / week</h3>
                <p className="mt-2">
                  <span className="text-2xl font-bold">$280</span>
                  <span className="text-muted-foreground">/month</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Save $20/month</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What's Included */}
        <div className="mt-16">
          <h2 className="text-center font-serif text-2xl font-bold">What&apos;s Included</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h4 className="font-medium">Personalized Curriculum</h4>
                <p className="text-sm text-muted-foreground">
                  Lessons tailored to your goals, skill level, and musical interests.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h4 className="font-medium">Online Student Portal</h4>
                <p className="text-sm text-muted-foreground">
                  Easy scheduling, payment, and communication through your personal dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h4 className="font-medium">Practice Resources</h4>
                <p className="text-sm text-muted-foreground">
                  Access to sheet music recommendations and practice guidance.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h4 className="font-medium">Performance Opportunities</h4>
                <p className="text-sm text-muted-foreground">
                  Optional recitals and performance events throughout the year.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
