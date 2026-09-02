"use client"

import { useState } from "react"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  ACCEPT_ALL_STATE,
  CATEGORY_COPY,
  CONSENT_CATEGORIES,
  REJECT_ALL_STATE,
  type ConsentCategory,
  type ConsentState,
} from "@/lib/consent/config"

type Props = {
  initial: ConsentState
  gpc: boolean
  onSave: (state: ConsentState) => void
}

/**
 * The body of the preferences dialog.
 *
 * Mounted only while the dialog is open, so the draft seeds itself from
 * `initial` on mount and needs no effect to stay in sync — reopening the
 * dialog remounts it with whatever is currently in force.
 */
export function ConsentPreferences({ initial, gpc, onSave }: Props) {
  const [draft, setDraft] = useState<ConsentState>(initial)

  function toggle(category: ConsentCategory, value: boolean) {
    setDraft((current) => ({ ...current, [category]: value, necessary: true }))
  }

  return (
    <DialogContent className="flex max-h-[85vh] flex-col gap-0 sm:max-w-xl">
      <DialogHeader className="shrink-0 text-left">
        <DialogTitle className="font-serif text-2xl font-bold">Cookie preferences</DialogTitle>
        <DialogDescription>
          Choose what we may store on your device. You can change this at any time from the{" "}
          <span className="text-foreground">Cookie Preferences</span> link in the footer.
        </DialogDescription>
      </DialogHeader>

      <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
        {gpc ? (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-accent/10 px-3 py-2.5 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>
              Your browser is sending a Global Privacy Control signal, so advertising cookies stay off. We honour
              that signal as an opt-out of sharing your information.
            </span>
          </p>
        ) : null}

        <div className="mt-5 divide-y divide-border">
          {CONSENT_CATEGORIES.map((category) => {
            const copy = CATEGORY_COPY[category]
            const locked = copy.locked === true
            const disabled = locked || (category === "marketing" && gpc)

            return (
              <div key={category} className="flex items-start justify-between gap-4 py-4 first:pt-0">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{copy.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.detail}</p>
                </div>

                {locked ? (
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Always on
                  </span>
                ) : (
                  <Switch
                    checked={draft[category]}
                    disabled={disabled}
                    onCheckedChange={(value) => toggle(category, value)}
                    aria-label={`${copy.label} cookies`}
                  />
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Full details of every cookie we set are in our{" "}
          <Link href="/cookies" className="text-accent underline underline-offset-2 hover:opacity-80">
            Cookie Policy
          </Link>
          .
        </p>
      </div>

      <DialogFooter className="mt-5 shrink-0 gap-2 border-t border-border pt-5 sm:justify-between">
        <DialogClose asChild>
          <Button type="button" variant="ghost" size="lg" className="h-11" onClick={() => onSave(REJECT_ALL_STATE)}>
            Reject all
          </Button>
        </DialogClose>
        <div className="flex flex-col gap-2 sm:flex-row">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="lg" className="h-11" onClick={() => onSave(draft)}>
              Save my choices
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" size="lg" className="h-11" onClick={() => onSave(ACCEPT_ALL_STATE)}>
              Accept all
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </DialogContent>
  )
}
