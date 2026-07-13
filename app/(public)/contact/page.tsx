"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/public/page-header"
import { submitContactMessage, type ContactFormState } from "./actions"
import { Mail, Phone, CheckCircle } from "lucide-react"

const initialState: ContactFormState = {}

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactMessage, initialState)

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <PageHeader title="Contact Us" lede="Have a question? We'd love to hear from you." />

        <div className="mt-16 grid gap-12 md:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold">Get in Touch</h2>
              <p className="mt-2 text-muted-foreground">
                For lesson inquiries, please use our inquiry form for the fastest response.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Mail className="h-5 w-5 text-accent" aria-hidden />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">
                    <a
                      href="mailto:arpine@abamusicacademy.org"
                      className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      arpine@abamusicacademy.org
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Phone className="h-5 w-5 text-accent" aria-hidden />
                </div>
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-muted-foreground">
                    <a
                      href="tel:+18188362322"
                      className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      818-836-2322
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">Available during business hours</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-6">
              <h3 className="font-medium">Studio Hours</h3>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>Monday - Friday: 1:00 PM - 9:00 PM</p>
                <p>Saturday: 10:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold leading-none">Send a Message</h2>
              <CardDescription>Fill out the form below and we&apos;ll get back to you soon.</CardDescription>
            </CardHeader>
            <CardContent>
              {state.success ? (
                <div className="flex flex-col items-center py-8 text-center" role="status">
                  <CheckCircle className="h-12 w-12 text-accent" aria-hidden />
                  <h3 className="mt-4 text-lg font-semibold">Message Sent!</h3>
                  <p className="mt-2 text-muted-foreground">
                    Thank you for reaching out. We&apos;ll respond within 1-2 business days.
                  </p>
                </div>
              ) : (
                <form action={formAction} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" required autoComplete="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" required placeholder="What is this regarding?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" required placeholder="Your message..." rows={5} />
                  </div>
                  {state.error && (
                    <p role="alert" aria-live="polite" className="text-sm text-destructive">
                      {state.error}
                    </p>
                  )}
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
