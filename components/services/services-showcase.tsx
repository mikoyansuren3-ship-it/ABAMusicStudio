"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Atom, BookOpen, Calculator, Crown, Languages, Music } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const ChessKnightScene = dynamic(
  () => import("./chess-knight-scene").then((module) => module.ChessKnightScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full items-center justify-center rounded-2xl bg-muted/40 md:h-[560px]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    ),
  },
)

type Service = {
  id: "piano" | "chess" | "violin" | "english" | "science" | "math"
  name: string
  tagline: string
  description: string
  icon: LucideIcon
}

const services: Service[] = [
  {
    id: "piano",
    name: "Piano",
    tagline: "Foundations, repertoire, and musical confidence.",
    description:
      "Personalized piano instruction remains at the heart of ABA Music Studio, with lessons shaped around each student's pace and goals.",
    icon: Music,
  },
  {
    id: "chess",
    name: "Chess",
    tagline: "Strategy, focus, and creative problem solving.",
    description:
      "Chess coaching is coming soon for students who want to build patience, pattern recognition, and confident decision-making.",
    icon: Crown,
  },
  {
    id: "violin",
    name: "Violin",
    tagline: "Expression, technique, and beautiful tone.",
    description:
      "Violin lessons are planned for students ready to explore strings with thoughtful guidance and a strong musical foundation.",
    icon: Music,
  },
  {
    id: "english",
    name: "English",
    tagline: "Reading, writing, and clear communication.",
    description:
      "English support will help students grow their vocabulary, comprehension, writing skills, and classroom confidence.",
    icon: Languages,
  },
  {
    id: "science",
    name: "Science",
    tagline: "Curiosity, experiments, and big ideas.",
    description:
      "Science sessions are being designed to make concepts approachable through guided discovery and hands-on thinking.",
    icon: Atom,
  },
  {
    id: "math",
    name: "Math",
    tagline: "Number sense, practice, and problem solving.",
    description:
      "Math tutoring will focus on strengthening fundamentals, reducing frustration, and building steady academic confidence.",
    icon: Calculator,
  },
]

function ComingSoonRender({ service }: { service: Service }) {
  const Icon = service.id === "english" ? BookOpen : service.icon

  return (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border bg-muted/30 p-8 text-center md:h-[560px]">
      <div className="mx-auto max-w-sm">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-accent/10 text-accent shadow-inner">
          <Icon className="h-12 w-12" />
        </div>
        <Badge variant="secondary" className="mt-8">
          Stay Tuned
        </Badge>
        <h3 className="mt-4 font-serif text-2xl font-bold">{service.name} render coming soon</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We are starting with one polished chess render first. This tab is ready for the next 3D topic once the service
          details are confirmed.
        </p>
      </div>
    </div>
  )
}

export function ServicesShowcase() {
  const [activeServiceId, setActiveServiceId] = useState<Service["id"]>("chess")

  const activeService = useMemo(
    () => services.find((service) => service.id === activeServiceId) ?? services[0],
    [activeServiceId],
  )

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="border-accent/40 text-accent">
            New programs are coming
          </Badge>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight md:text-5xl">Upcoming Services</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            ABA Music Studio is preparing a wider set of learning options. Teacher details and schedules will be updated
            here as each service is confirmed.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,440px)_1fr] lg:items-start">
          <div className="space-y-5">
            <div>
              <h2 className="font-serif text-2xl font-bold">Explore the lineup</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Choose a square tab to preview each upcoming service. Chess is the first interactive 3D render in this
                showcase.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {services.map((service) => {
                const Icon = service.icon
                const isActive = service.id === activeService.id

                return (
                  <button
                    key={service.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveServiceId(service.id)}
                    className={cn(
                      "group flex aspect-square flex-col rounded-2xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-accent/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive && "border-accent bg-accent/5 shadow-md",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors",
                          isActive && "bg-accent text-accent-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <Badge variant={isActive ? "default" : "secondary"} className={cn(isActive && "bg-accent")}>
                        Stay Tuned
                      </Badge>
                    </div>

                    <div className="mt-auto">
                      <h3 className="font-serif text-xl font-bold">{service.name}</h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                        {service.tagline}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            <Card className="border-accent/20 bg-muted/25">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="outline">Selected</Badge>
                    <h3 className="mt-3 font-serif text-2xl font-bold">{activeService.name}</h3>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">Stay Tuned</Badge>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{activeService.description}</p>
                <Button className="mt-6" asChild>
                  <Link href="/inquire">Ask about updates</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-24">
            {activeService.id === "chess" ? <ChessKnightScene /> : <ComingSoonRender service={activeService} />}
            {activeService.id !== "chess" && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                This topic is ready for a future 3D render once the chess knight is approved.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
