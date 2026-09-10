"use client"

/**
 * Client-side consent store.
 *
 * Written as an external store (subscribe / getSnapshot) rather than React
 * state because the source of truth is `document.cookie`, which does not exist
 * during SSR. `useSyncExternalStore` gives us a defined server snapshot and a
 * post-hydration read without a setState-in-effect — see the project's lint
 * rules and design-system/MASTER.md.
 */
import { useSyncExternalStore } from "react"
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  LEGACY_CONSENT_COOKIE,
  PRE_DECISION_STATE,
  type ConsentCategory,
  type ConsentRecord,
  type ConsentState,
} from "./config"
import { buildRecord, decodeConsent, encodeConsent } from "./record"

export type ConsentSnapshot = {
  /** False during SSR and the first paint, before the cookie has been read. */
  ready: boolean
  /** True once the visitor has made an explicit choice at the current version. */
  decided: boolean
  /** A Global Privacy Control signal is present on this browser. */
  gpc: boolean
  /** Consent actually in force, after GPC is applied. */
  state: ConsentState
  record: ConsentRecord | null
}

const SERVER_SNAPSHOT: ConsentSnapshot = {
  ready: false,
  decided: false,
  gpc: false,
  state: PRE_DECISION_STATE,
  record: null,
}

const listeners = new Set<() => void>()
let cached: ConsentSnapshot | null = null

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`
  for (const entry of document.cookie.split(";")) {
    const trimmed = entry.trim()
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length)
  }
  return undefined
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = window.location.protocol === "https:" ? "; secure" : ""
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax${secure}`
}

function deleteCookie(name: string) {
  // Clear on the bare host and on the registrable domain — third-party tags set
  // their cookies on the dot-prefixed domain, so one form is not enough.
  const host = window.location.hostname
  const parts = host.split(".")
  const domains = [undefined, host, parts.length > 2 ? `.${parts.slice(-2).join(".")}` : `.${host}`]

  for (const domain of domains) {
    const scope = domain ? `; domain=${domain}` : ""
    document.cookie = `${name}=; path=/; max-age=0${scope}`
  }
}

/**
 * Global Privacy Control. California requires that a GPC signal be honoured as
 * a valid opt-out of sale/sharing, without the visitor doing anything else, so
 * it overrides a stored opt-in rather than merely seeding the default.
 */
function detectGpc(): boolean {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
}

function applyGpc(state: ConsentState, gpc: boolean): ConsentState {
  if (!gpc || !state.marketing) return state
  return { ...state, marketing: false }
}

function computeSnapshot(): ConsentSnapshot {
  const record = decodeConsent(readCookie(CONSENT_COOKIE))
  const gpc = detectGpc()
  return {
    ready: true,
    decided: record !== null,
    gpc,
    state: applyGpc(record?.state ?? PRE_DECISION_STATE, gpc),
    record,
  }
}

function getSnapshot(): ConsentSnapshot {
  cached ??= computeSnapshot()
  return cached
}

function getServerSnapshot(): ConsentSnapshot {
  return SERVER_SNAPSHOT
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function emit() {
  cached = null
  for (const listener of listeners) listener()
}

/**
 * Cookies dropped by the tags in each category. When consent is withdrawn we
 * delete what is already on the device — switching a tag off for future page
 * views is not, on its own, an honoured opt-out.
 */
const CATEGORY_COOKIES: Partial<Record<ConsentCategory, readonly string[]>> = {
  analytics: ["_ga", "_gid", "_gat"],
  marketing: ["_gcl_au", "_gcl_aw", "_gcl_dc", "_fbp", "_fbc"],
}

function purgeWithdrawn(previous: ConsentState, next: ConsentState) {
  for (const [category, names] of Object.entries(CATEGORY_COOKIES)) {
    if (previous[category as ConsentCategory] && !next[category as ConsentCategory]) {
      for (const name of names) deleteCookie(name)
    }
  }

  // GA4 also writes a per-property cookie, _ga_<MEASUREMENT_ID>.
  if (previous.analytics && !next.analytics) {
    for (const entry of document.cookie.split(";")) {
      const name = entry.trim().split("=")[0]
      if (name.startsWith("_ga_")) deleteCookie(name)
    }
  }
}

/** Records a decision, clears anything the visitor just withdrew, and notifies. */
export function saveConsent(state: ConsentState) {
  const previous = getSnapshot().state
  const gpc = detectGpc()
  const next = applyGpc({ ...state, necessary: true }, gpc)

  writeCookie(CONSENT_COOKIE, encodeConsent(buildRecord(next, gpc, Date.now())), CONSENT_MAX_AGE_SECONDS)
  deleteCookie(LEGACY_CONSENT_COOKIE)
  purgeWithdrawn(previous, next)
  emit()
}

export function useConsent(): ConsentSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Convenience for tag components: has this category been granted right now? */
export function useConsentFor(category: ConsentCategory): boolean {
  const { ready, state } = useConsent()
  return ready && state[category]
}

// ── Preferences dialog channel ───────────────────────────────────────────────
// The footer links live far from the dialog, so opening it goes through a tiny
// event bus rather than lifted state or a context provider.

const openListeners = new Set<() => void>()

export function openConsentPreferences() {
  for (const listener of openListeners) listener()
}

export function subscribeToPreferencesOpen(listener: () => void): () => void {
  openListeners.add(listener)
  return () => {
    openListeners.delete(listener)
  }
}
