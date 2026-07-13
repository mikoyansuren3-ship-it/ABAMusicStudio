"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const CONSENT_COOKIE = "aba_cookie_consent"
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function hasConsent() {
  return document.cookie.split(";").some((entry) => entry.trim().startsWith(`${CONSENT_COOKIE}=`))
}

function acceptConsent() {
  const secure = window.location.protocol === "https:" ? "; secure" : ""
  document.cookie = `${CONSENT_COOKIE}=accepted; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax${secure}`
}

const noSubscription = () => () => {}

export function CookieNotice() {
  const [dismissed, setDismissed] = useState(false)
  // Render nothing on the server / first paint, then reflect the cookie state.
  const mounted = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  )

  if (!mounted || dismissed || hasConsent()) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm supports-[backdrop-filter]:bg-background/90"
    >
      <div className="container mx-auto flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          This website uses cookies to keep you signed in, remember your preferences, and improve your experience.{" "}
          <Link href="/policies" className="text-foreground underline underline-offset-4 hover:text-foreground/80">
            Learn more
          </Link>
        </p>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          onClick={() => {
            acceptConsent()
            setDismissed(true)
          }}
        >
          Accept
        </Button>
      </div>
    </div>
  )
}
