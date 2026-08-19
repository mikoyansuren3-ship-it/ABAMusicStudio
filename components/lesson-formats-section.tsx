import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formats = [
  {
    duration: 30,
    title: "30 Minutes",
    description: "A focused pace for young beginners and foundation building.",
  },
  {
    duration: 45,
    title: "45 Minutes",
    description: "A balanced lesson length for most growing students.",
    popular: true,
  },
] as const

export function LessonFormatsSection() {
  return (
    <section aria-labelledby="lesson-formats-heading">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="lesson-formats-heading" className="font-serif text-3xl font-bold">
          Lesson Options
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Private one-on-one instruction, once or twice per week at a regular weekly time.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-8 md:grid-cols-2">
        {formats.map((option) => (
          <Card key={option.duration} className={"popular" in option && option.popular ? "border-accent shadow-lg" : ""}>
            <CardHeader>
              {"popular" in option && option.popular && (
                <Badge className="mb-2 w-fit bg-accent text-accent-foreground">Most Popular</Badge>
              )}
              <CardTitle>{option.title}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Weekly private lessons at a consistent time</li>
                <li>Once or twice per week — your choice</li>
                <li>Personalized curriculum and practice guidance</li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/inquire">Inquire About Lessons</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted-foreground">
        Tuition depends on lesson length and weekly frequency — we&apos;ll share current rates when you inquire. Every
        new student starts with a free trial lesson.
      </p>
    </section>
  )
}
