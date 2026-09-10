import "server-only"

import { cookies } from "next/headers"
import { CONSENT_COOKIE, PRE_DECISION_STATE, type ConsentRecord, type ConsentState } from "./config"
import { decodeConsent } from "./record"

/**
 * Server-side view of the visitor's consent. Reading cookies opts the calling
 * route out of static rendering, so use this only in already-dynamic
 * server code — the public marketing pages gate their tags on the client
 * instead, precisely to stay static.
 */
export async function getConsentRecord(): Promise<ConsentRecord | null> {
  const store = await cookies()
  return decodeConsent(store.get(CONSENT_COOKIE)?.value)
}

/** Effective consent, falling back to the pre-decision posture. */
export async function getConsentState(): Promise<ConsentState> {
  const record = await getConsentRecord()
  return record?.state ?? PRE_DECISION_STATE
}
