/**
 * Serialisation for the consent cookie. Pure functions only — no `document`,
 * no `next/headers` — so both the client store and the server reader can use
 * them.
 *
 * The stored value is URL-encoded JSON rather than an opaque blob so that a
 * visitor (or a regulator) can open dev tools and read exactly what we
 * recorded.
 */
import {
  CONSENT_CATEGORIES,
  CONSENT_VERSION,
  PRE_DECISION_STATE,
  type ConsentRecord,
  type ConsentState,
} from "./config"

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean"
}

/** Coerces arbitrary parsed JSON into a full state, filling gaps from the defaults. */
function normaliseState(input: unknown): ConsentState {
  const source = (input ?? {}) as Record<string, unknown>
  const state = { ...PRE_DECISION_STATE }

  for (const category of CONSENT_CATEGORIES) {
    const value = source[category]
    if (isBoolean(value)) state[category] = value
  }

  // Necessary cookies are not negotiable, whatever the cookie claims.
  state.necessary = true
  return state
}

export function encodeConsent(record: ConsentRecord): string {
  return encodeURIComponent(JSON.stringify(record))
}

/**
 * Returns null for anything we cannot trust: malformed JSON, a stale version,
 * or a missing decision timestamp. Null means "no decision" — the banner shows.
 */
export function decodeConsent(raw: string | undefined | null): ConsentRecord | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentRecord>
    if (parsed?.version !== CONSENT_VERSION) return null
    if (typeof parsed.decidedAt !== "number" || !Number.isFinite(parsed.decidedAt)) return null

    return {
      version: CONSENT_VERSION,
      state: normaliseState(parsed.state),
      decidedAt: parsed.decidedAt,
      gpc: parsed.gpc === true,
    }
  } catch {
    return null
  }
}

export function buildRecord(state: ConsentState, gpc: boolean, now: number): ConsentRecord {
  return {
    version: CONSENT_VERSION,
    state: normaliseState(state),
    decidedAt: now,
    gpc,
  }
}
