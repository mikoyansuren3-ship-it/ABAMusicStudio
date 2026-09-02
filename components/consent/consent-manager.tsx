"use client"

/**
 * Mounts the consent banner, the preferences dialog, and the consent-gated
 * tags. Rendered once from the root layout so it covers the marketing site,
 * the enrolment flow, the auth pages, and the portals alike.
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { Cookie } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { ConsentPreferences } from "@/components/consent/consent-preferences"
import { ConsentTags } from "@/components/consent/consent-tags"
import { ACCEPT_ALL_STATE, REJECT_ALL_STATE, type ConsentState } from "@/lib/consent/config"
import { saveConsent, subscribeToPreferencesOpen, useConsent } from "@/lib/consent/store"

export function ConsentManager() {
  const { ready, decided, gpc, state } = useConsent()
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  // The footer links live outside this tree, so they ask the store to open the
  // dialog. Registering the listener is the effect; the state change happens
  // later, when a visitor actually clicks.
  useEffect(() => subscribeToPreferencesOpen(() => setPreferencesOpen(true)), [])

  function decide(next: ConsentState) {
    saveConsent(next)
  }

  // `ready` is false during SSR and the first paint, which keeps the banner out
  // of the server-rendered HTML and avoids a hydration mismatch.
  const showBanner = ready && !decided

  return (
    <>
      <ConsentTags />

      {showBanner ? (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
        >
          <div className="container mx-auto px-3 pb-3 md:px-4 md:pb-4">
            <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-sm supports-[backdrop-filter]:bg-card/90 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
                <div className="flex gap-3">
                  <Cookie className="mt-0.5 hidden h-5 w-5 shrink-0 text-accent sm:block" aria-hidden="true" />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">We use cookies</h2>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      Some keep you signed in and make the site work. Others help us see which pages families read,
                      or measure our advertising — and those stay off until you allow them.{" "}
                      <Link
                        href="/cookies"
                        className="text-accent underline underline-offset-2 hover:opacity-80"
                      >
                        Cookie Policy
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="col-span-2 h-11 md:col-span-1"
                    onClick={() => setPreferencesOpen(true)}
                  >
                    Customize
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11"
                    onClick={() => decide(REJECT_ALL_STATE)}
                  >
                    Reject all
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    className="h-11"
                    onClick={() => decide(ACCEPT_ALL_STATE)}
                  >
                    Accept all
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        {preferencesOpen ? <ConsentPreferences initial={state} gpc={gpc} onSave={decide} /> : null}
      </Dialog>
    </>
  )
}
