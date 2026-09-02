"use client"

/**
 * Loads the measurement and advertising tags, and only the ones the visitor
 * has allowed.
 *
 * Two things are deliberate here:
 *
 * 1. **Nothing loads without an ID.** Every tag is skipped when its
 *    `NEXT_PUBLIC_*` variable is unset, so this ships inert and switches on
 *    when the owner adds the IDs in Vercel. No code change needed.
 * 2. **We use "basic" Google Consent Mode** — gtag.js is not requested at all
 *    until analytics or advertising is granted, rather than loaded up front in
 *    a cookieless state. A visitor who says no causes no request to Google.
 *    Consent defaults are still declared before `config` runs so that the very
 *    first hit carries the right signals.
 */
import { useEffect } from "react"
import Script from "next/script"
import { Analytics as VercelAnalytics } from "@vercel/analytics/next"
import { TAG_IDS } from "@/lib/consent/config"
import { useConsent } from "@/lib/consent/store"

type ConsentSignals = {
  ad_storage: "granted" | "denied"
  ad_user_data: "granted" | "denied"
  ad_personalization: "granted" | "denied"
  analytics_storage: "granted" | "denied"
  functionality_storage: "granted" | "denied"
  personalization_storage: "granted" | "denied"
  security_storage: "granted" | "denied"
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] }
    _fbq?: unknown
  }
}

function grant(value: boolean): "granted" | "denied" {
  return value ? "granted" : "denied"
}

function toSignals(analytics: boolean, marketing: boolean, functional: boolean): ConsentSignals {
  return {
    ad_storage: grant(marketing),
    ad_user_data: grant(marketing),
    ad_personalization: grant(marketing),
    analytics_storage: grant(analytics),
    functionality_storage: grant(functional),
    personalization_storage: grant(functional),
    security_storage: "granted",
  }
}

export function ConsentTags() {
  const { ready, state } = useConsent()
  const { analytics, marketing, functional } = state

  const wantsGoogle = ready && (analytics || marketing)
  const googleId = TAG_IDS.ga4 || TAG_IDS.googleAds

  // Re-declare consent to an already-loaded gtag when the visitor changes their
  // mind. This is a side effect on an external script, not React state, so it
  // belongs in an effect.
  useEffect(() => {
    if (!ready || typeof window.gtag !== "function") return
    window.gtag("consent", "update", toSignals(analytics, marketing, functional))
  }, [ready, analytics, marketing, functional])

  const bootstrap = [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    "window.gtag = gtag;",
    `gtag('consent','default',${JSON.stringify(toSignals(analytics, marketing, functional))});`,
    "gtag('js', new Date());",
    TAG_IDS.ga4 ? `gtag('config','${TAG_IDS.ga4}',{anonymize_ip:true});` : "",
    TAG_IDS.googleAds ? `gtag('config','${TAG_IDS.googleAds}');` : "",
  ]
    .filter(Boolean)
    .join("\n")

  return (
    <>
      {/*
        Vercel Analytics is cookieless and first-party, so it needs no consent
        under the cookie rules. We gate it on the analytics category anyway:
        the banner tells visitors that rejecting stops us measuring their
        visit, and that promise should be true of every measurement tool.
      */}
      {ready && analytics ? <VercelAnalytics /> : null}

      {wantsGoogle && googleId ? (
        <>
          <Script
            id="google-tag-bootstrap"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: bootstrap }}
          />
          <Script
            id="google-tag"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleId}`}
          />
        </>
      ) : null}

      {ready && marketing && TAG_IDS.metaPixel ? (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: [
              "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?",
              "n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;",
              "n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;",
              "t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,",
              "document,'script','https://connect.facebook.net/en_US/fbevents.js');",
              `fbq('init','${TAG_IDS.metaPixel}');fbq('track','PageView');`,
            ].join(""),
          }}
        />
      ) : null}
    </>
  )
}
