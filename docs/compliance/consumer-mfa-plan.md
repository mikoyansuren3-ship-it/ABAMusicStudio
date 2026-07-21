# Consumer MFA Before Plaid Link — Build Scope (Questionnaire Q4)

**Status:** Scoping / design. Not yet built.
**Last updated:** July 20, 2026

---

## 1. The requirement

Plaid Q4: *"Does your organization provide multi-factor authentication (MFA) for consumers … before Plaid Link is surfaced?"*

In plain terms: **a consumer must clear an MFA check before they can open Plaid Link to connect a bank account.** The gate lives at the moment Plaid Link is launched — the tuition payment / connect-a-bank flow.

## 2. Current state (from the code)

- **Auth:** Supabase (email/password + Google OAuth) via `@supabase/ssr`. Consumers are the `student`-role accounts (a parent/guardian).
- **Route protection is per-page, server-side** — e.g. `app/portal/layout.tsx` and `app/portal/pay/[invoiceId]/page.tsx` call `supabase.auth.getUser()` and redirect. **There is no root `middleware.ts`.**
- **Where Plaid Link will surface:** the payment flow — `app/portal/pay/[invoiceId]/page.tsx` (today renders Stripe `InvoiceCheckout`) and/or a future "payment methods / connect bank" screen.
- **MFA today:** none. Greenfield.
- **Plaid integration:** not built yet (no Plaid code, no `link_token` route, no bank tables).

## 3. What we build on: Supabase MFA

Supabase Auth has native MFA — no third-party MFA service needed.

- **Factor type:** TOTP (authenticator app — Google Authenticator, 1Password, Authy, etc.). Recommended. Works regardless of how the user signed in (including Google OAuth).
- **Assurance levels (AAL):** `aal1` = password only; `aal2` = password + a verified MFA factor **this session**.
- **APIs:** `supabase.auth.mfa.enroll()`, `.challenge()`, `.verify()`, `.unenroll()`, and `getAuthenticatorAssuranceLevel()` → `{ currentLevel, nextLevel }`:
  - `aal1 / aal1` → no factor enrolled
  - `aal1 / aal2` → factor enrolled, **needs a challenge this session** (step-up)
  - `aal2 / aal2` → fully MFA-authenticated
- **Enforcement in the database:** RLS policies can require `(auth.jwt() ->> 'aal') = 'aal2'`, so bank/Plaid data is unreadable without a completed MFA challenge — defense in depth behind the UI gate.
- **Prerequisite:** enable the TOTP factor in the Supabase dashboard (Authentication → MFA). One-time setting.

## 4. Two approaches

### Approach A — Step-up MFA at the Plaid Link entry point  ✅ *recommended*
Consumers log in normally (aal1). When they go to connect a bank / launch Plaid Link, that action is gated on aal2:
- No factor enrolled → prompt to enroll TOTP inline (or send to a security page), then challenge.
- Enrolled but aal1 → prompt for the 6-digit code (step-up to aal2).
- aal2 → render Plaid Link.

*Pros:* proportionate to exactly what Q4 asks; only affects users who actually use Plaid; lowest friction for the majority of parents. *Cons:* slightly more flow logic (enroll + challenge inline).

### Approach B — Require MFA for every portal login
Every consumer must enroll MFA and reach aal2 at login before the portal opens (single choke point in `app/portal/layout.tsx`).

*Pros:* simplest model; strongest posture. *Cons:* forces MFA on every parent even if they never touch Plaid; more support burden (lost authenticators); more than Q4 strictly requires.

**Recommendation:** Approach A. It satisfies Q4 precisely and keeps friction off users who don't use bank payments. It can be upgraded to B later by moving the same aal2 check into the portal layout.

## 5. Work breakdown (Approach A)

| # | Item | Where | Notes |
|---|------|-------|-------|
| 1 | Enable TOTP MFA | Supabase dashboard | One-time prereq (Authentication → MFA) |
| 2 | AAL helpers | `lib/auth/mfa.ts` (new) | `getAssuranceLevel()`, `requireAAL2()` guard for server components/actions |
| 3 | Enrollment UI | `components/auth/mfa-enroll.tsx` (new) | Enroll TOTP → render QR + secret → verify code → done |
| 4 | Challenge UI | `components/auth/mfa-challenge.tsx` (new) | Existing factor → 6-digit code → verify → aal2 |
| 5 | Security settings | portal profile (e.g. `app/portal/profile`) | Manage factors: enroll, view status, unenroll |
| 6 | The Plaid Link gate | payment / connect-bank page | If no factor → enroll; if aal1 → challenge; only at aal2 render Plaid Link |
| 7 | Server enforcement | future Plaid `link_token` route | Re-check aal2 server-side before minting a `link_token` (never trust the client) |
| 8 | RLS | migration (`scripts/00X_*.sql`) | Require `aal2` on any table holding Plaid tokens / bank data |
| 9 | Recovery path | admin tooling | Handle lost-device: allow a 2nd factor + owner-assisted unenroll via service role |

**Related (optional but recommended):** add a root `middleware.ts` using the existing `utils/supabase/middleware.ts` helper to refresh sessions centrally. Not required for MFA, but the project is currently missing it.

**No app schema change is needed for the MFA factors themselves** — Supabase stores them internally (`auth.mfa_factors`). The RLS work (#8) attaches to the Plaid/bank tables, which belong to the separate Plaid build.

## 6. Sequencing

The Plaid Link surface doesn't exist yet, so:

1. **Build the MFA primitives now** — helpers (#2), enrollment (#3), challenge (#4), and the security settings page (#5). These are independently useful, shippable, and testable without Plaid.
2. **Wire the gate (#6–#8) when the Plaid integration is built**, reusing those primitives.

This de-risks the work and lets MFA land and be verified on its own.

## 7. Rough effort

- MFA primitives + enrollment/challenge UI + security page: ~1.5–2 days
- Gate + server check + RLS (with the Plaid build): ~0.5–1 day
- Testing + recovery edge cases: ~0.5–1 day
- **Total: ~2.5–4 focused days**, most of it doable before the Plaid work begins.

## 8. Edge cases / risks

- **Lost authenticator / lockout.** Plan: encourage enrolling a second factor; provide an owner-assisted unenroll (service-role) path. Supabase does not auto-issue TOTP recovery codes.
- **Google-OAuth users.** They can still enroll and be challenged for TOTP — the step-up works regardless of sign-in method.
- **Session longevity.** aal2 is per-session; a returning user with an enrolled factor will need to re-challenge when the session drops to aal1. The gate handles this automatically.
- **UX for non-technical parents.** TOTP requires an authenticator app; the enrollment screen should include short "what's an authenticator app" guidance.

## 9. Testing plan

- Enroll a factor; confirm QR works with a real authenticator app; verify a valid/invalid code.
- Fresh login (aal1) → hit the Plaid gate → challenge → aal2 → Plaid Link renders.
- Attempt to reach the `link_token` route / bank data directly at aal1 → rejected (server + RLS).
- Lost-device path: owner-assisted unenroll restores access.

## 10. Decisions (locked in — July 20, 2026)

1. **Approach: A — step-up MFA at the Plaid Link entry point.** (Not blanket login MFA.)
2. **Factor type: TOTP authenticator app only.** No SMS or passkeys for now.
3. **Timing: build together with the Plaid integration**, in one pass — not as a separate earlier step. When the Plaid build starts, implement items #2–#8 from the work breakdown as part of it, using the step-up + TOTP design above.

**Not started yet** — this is the agreed design, to be executed when the Plaid integration is built.
