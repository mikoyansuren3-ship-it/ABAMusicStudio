import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { JsonLd } from "@/components/seo/json-ld"
import { breadcrumbSchema, type Crumb } from "@/lib/seo/schema"

/**
 * Visible breadcrumb trail + BreadcrumbList JSON-LD. Pass the trail *without*
 * Home; it is prepended automatically. The last crumb is the current page.
 */
export function Breadcrumbs({ trail, className = "" }: { trail: Crumb[]; className?: string }) {
  const crumbs: Crumb[] = [{ name: "Home", href: "/" }, ...trail]
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <nav aria-label="Breadcrumb" className={`text-sm text-muted-foreground ${className}`}>
        <ol className="flex flex-wrap items-center justify-center gap-1">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <li key={crumb.href} className="flex items-center gap-1">
                {index > 0 ? <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden /> : null}
                {isLast ? (
                  <span aria-current="page" className="font-medium text-foreground">
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.href} className="underline-offset-4 hover:text-foreground hover:underline">
                    {crumb.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
