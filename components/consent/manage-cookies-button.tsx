"use client"

import { openConsentPreferences } from "@/lib/consent/store"

/**
 * Opens the cookie preferences dialog from anywhere in the tree (the footer,
 * the cookie policy page). Rendered as a real button rather than a link
 * because it performs an action instead of navigating.
 *
 * CPRA § 1798.135 requires the "Do Not Sell or Share My Personal Information"
 * control to be clear and conspicuous on the site — it is the same dialog,
 * reached under the name the statute uses.
 */
export function ManageCookiesButton({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <button type="button" className={className} onClick={() => openConsentPreferences()}>
      {children}
    </button>
  )
}
