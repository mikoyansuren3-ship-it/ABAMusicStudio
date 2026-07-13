import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * Closing call-to-action, shared across public pages.
 * `panel` renders the dark rounded card; `plain` renders centered text + button.
 */
export function CtaSection({
  title,
  body,
  buttonLabel,
  href,
  variant = "plain",
}: {
  title?: string
  body: string
  buttonLabel: string
  href: string
  variant?: "panel" | "plain"
}) {
  if (variant === "panel") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
        {title ? <h2 className="font-serif text-2xl font-bold md:text-3xl">{title}</h2> : null}
        <p className="mt-4 text-primary-foreground/85">{body}</p>
        <Button size="lg" variant="secondary" className="mt-8" asChild>
          <Link href={href}>{buttonLabel}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center">
      {title ? <h2 className="font-serif text-2xl font-bold md:text-3xl">{title}</h2> : null}
      <p className={`text-lg text-muted-foreground ${title ? "mt-3" : ""}`}>{body}</p>
      <Button size="lg" className="mt-6" asChild>
        <Link href={href}>{buttonLabel}</Link>
      </Button>
    </div>
  )
}
