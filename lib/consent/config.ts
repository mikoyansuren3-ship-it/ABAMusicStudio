/**
 * Cookie-consent configuration — the single place where the studio's consent
 * posture is defined. Everything else (banner, preferences dialog, tag loader,
 * cookie policy page) reads from here.
 *
 * Legal model: California / US (CCPA-CPRA). That is an **opt-out** regime for
 * analytics and an **opt-out with a mandatory notice** for cross-context
 * behavioural advertising. We go one step further than the statute and hold
 * marketing tags until the visitor affirmatively opts in, because the studio
 * teaches minors and CPRA § 1798.120(c) requires opt-in consent to sell or
 * share the personal information of consumers under 16.
 *
 * To move to a GDPR / ePrivacy posture (opt-in for everything non-essential),
 * flip `analytics` to `false` in PRE_DECISION_STATE below. Nothing else needs
 * to change — the banner, the tag loader, and Google Consent Mode all derive
 * their behaviour from that constant.
 */

export const CONSENT_COOKIE = "aba_consent"

/**
 * Cookie set by the previous accept-only banner. It recorded a decision about
 * a narrower set of cookies than we run today, so it cannot be carried
 * forward — we clear it and ask again.
 */
export const LEGACY_CONSENT_COOKIE = "aba_cookie_consent"

/**
 * Bump when the categories or the vendors inside them change materially. A
 * stored record with an older version is treated as "no decision" and the
 * banner returns, which is what re-consent requires.
 */
export const CONSENT_VERSION = 1

/** 12 months — the CPRA re-consent interval, and the ceiling we set on our own cookies. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

export const CONSENT_CATEGORIES = ["necessary", "functional", "analytics", "marketing"] as const

export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number]

export type ConsentState = Record<ConsentCategory, boolean>

export type ConsentRecord = {
  version: number
  state: ConsentState
  /** Epoch ms of the visitor's decision — our proof-of-consent record. */
  decidedAt: number
  /** Whether a Global Privacy Control signal was present at decision time. */
  gpc: boolean
}

/**
 * What runs before the visitor has chosen. Analytics is on (CCPA opt-out);
 * marketing is off until an affirmative opt-in. Necessary can never be off.
 */
export const PRE_DECISION_STATE: ConsentState = {
  necessary: true,
  functional: true,
  analytics: true,
  marketing: false,
}

export const ACCEPT_ALL_STATE: ConsentState = {
  necessary: true,
  functional: true,
  analytics: true,
  marketing: true,
}

export const REJECT_ALL_STATE: ConsentState = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
}

type CategoryCopy = {
  label: string
  summary: string
  /** Shown in the preferences dialog under the toggle. */
  detail: string
  /** Locked categories render a static "Always on" pill instead of a switch. */
  locked?: boolean
}

export const CATEGORY_COPY: Record<ConsentCategory, CategoryCopy> = {
  necessary: {
    label: "Strictly necessary",
    summary: "Required for the site to work. Always on.",
    detail:
      "Keeps you signed in to the student, teacher, and admin portals — including staying signed in between visits when you tick “Remember me” — protects forms and payments against fraud, and stores this cookie choice itself. The site cannot function without these, so they cannot be switched off.",
    locked: true,
  },
  functional: {
    label: "Functional",
    summary: "Remembers you and your preferences.",
    detail:
      "Remembers your email on the login page so signing in is quicker, so you only have to type your password. Turning this off means filling in your email from scratch every time.",
  },
  analytics: {
    label: "Analytics",
    summary: "Helps us see which pages families actually use.",
    detail:
      "Counts visits and shows us which lesson pages people read, where they arrive from, and where they get stuck, so we can improve the site. We look at these numbers in aggregate — never to identify an individual family.",
  },
  marketing: {
    label: "Advertising",
    summary: "Measures our ads. Off unless you turn it on.",
    detail:
      "Lets us see which of our ads led to an enquiry and show our lessons to people with similar interests. These are the only cookies set by advertising companies rather than by us, and they are the reason the “Do Not Sell or Share” link exists. They stay off until you switch them on.",
  },
}

/** Tag IDs. Each tag is skipped entirely when its ID is absent from the env. */
export const TAG_IDS = {
  ga4: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "",
  googleAds: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "",
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "",
} as const
