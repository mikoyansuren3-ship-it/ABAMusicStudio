# Compliance & Security Documentation

This folder holds the governance documents required to complete the **Plaid production-access security questionnaire** and to operate the ABA Music Academy application responsibly.

> **These are drafts.** Before relying on any of them:
> 1. Search every file for `FILL-IN` and replace the bracketed placeholders with real values.
> 2. Have the **Privacy Policy** reviewed by legal counsel before publishing it (it is a public legal document; children's data and financial data raise the stakes).
> 3. Do not attest "yes" on the questionnaire for a control until the tracker below shows it is actually **Live**.

---

## Documents

| File | Covers questionnaire | Audience |
|------|----------------------|----------|
| [information-security-policy.md](information-security-policy.md) | Q2, Q3, Q5, Q6, Q7, Q8 | Internal (may be requested by Plaid) |
| [privacy-policy.md](privacy-policy.md) | Q9, Q10 | Public — publish at `/privacy` |
| [data-retention-and-deletion-policy.md](data-retention-and-deletion-policy.md) | Q11 | Internal + summarized in Privacy Policy |
| [mfa-checklist.md](mfa-checklist.md) | Q5 | Internal — owner worklist |
| [consumer-mfa-plan.md](consumer-mfa-plan.md) | Q4 | Internal — agreed design, builds with Plaid |
| [rls-audit.md](rls-audit.md) | Q3 | Internal — audit evidence |
| [plaid-submission-checklist.md](plaid-submission-checklist.md) | All | **Start here** — ordered owner actions + answer key |

## Shared facts to fill in once (used across all three docs)

| Placeholder | Value to supply |
|-------------|-----------------|
| Legal entity name & type | e.g. "ABA Music Academy, LLC" (footer trade name is "ABA Music Academy") |
| Registered business address | Full mailing address |
| Governing-law state | Likely California (area code 818) — confirm |
| Security/privacy contact inbox | Recommend creating `security@abamusicacademy.org` and `privacy@abamusicacademy.org`, both **monitored** |
| Effective date | The date each doc is published |

Known-good facts already pulled from the codebase (verify, but these are current):
- **Public contact:** arpine@abamusicacademy.org · 818-836-2322 · instagram.com/aba_music_academy
- **Website:** abamusicacademy.org
- **Sub-processors in use:** Supabase (DB/auth/storage), Vercel (hosting), Stripe (payments), Resend (email), Google (sign-in), browser push. **Planned:** Plaid (bank connection).

---

## Questionnaire gap tracker

Legend: ✅ Live · 🟡 Partial / needs config · 🔴 Not started · 📄 Doc drafted (needs review/publish)

| # | Question | Status | What still has to happen |
|---|----------|--------|--------------------------|
| 1 | Security contact | 🔴 | Create a monitored `security@` alias; put a real name/title on the form |
| 2 | Documented, operationalized infosec policy | 📄 | Policy drafted; "operationalized" is only honest once MFA + scanning items (5, 8) are Live |
| 3 | Access controls to prod & sensitive data | ✅ hardened | [rls-audit.md](rls-audit.md): live anon probe passed; hardening migrations `006`/`007` **plus follow-up `008`** (anon UPDATE grant on notifications, found during rollout) **applied to production 2026-08-03** and verified against the live catalog. Security Advisor re-run: audit findings cleared. Still to do: authenticated cross-tenant test + three small advisor hygiene items (see checklist A1) |
| 4 | MFA for consumers before Plaid Link | 🔵 designed | Design agreed in [consumer-mfa-plan.md](consumer-mfa-plan.md): Supabase **TOTP step-up** gate at the Plaid Link entry point. To be **built together with the Plaid integration** (~0.5–1 day of the Plaid build). Not started |
| 5 | MFA for internal access to financial-data systems | 🟡 | Checklist ready in [mfa-checklist.md](mfa-checklist.md) — work through it (dashboard settings, no code). Becomes ✅ once every box is checked |
| 6 | TLS 1.2+ in transit | ✅ | Provided by Vercel + Supabase/Stripe APIs. Confirm no plain-HTTP endpoints |
| 7 | Consumer data encrypted at rest | ✅ | Supabase Postgres = AES-256 at rest. Confirm Plaid data will live there |
| 8 | Vulnerability scanning (endpoints + prod) | ✅ (deps) · 🔴 (endpoints) | Dependabot fully live and exercised: **19 alerts (10 high) triaged to 0 on 2026-08-03** (PR #38); weekly grouped version updates merged (PRs #40/#41); 24 unused packages removed to shrink the attack surface — runtime deps 51→27 (PR #42). Four major-version PRs deliberately deferred (eslint 10, TypeScript 7, sonner 2, and stripe 22 — revisit stripe with the Plaid build). Managed platforms (Supabase/Vercel/Stripe) scan their own infra. **Still open:** endpoint/laptop posture — decide + document |
| 9 | Privacy policy where Link is deployed | 📄 | Draft ready; legal review, then publish at `/privacy` and link it |
| 10 | Consumer consent for collection/processing | ✅ | Consent checkbox linking the Privacy Policy added to sign-up and inquiry forms (client gate + server check; sign-up records acceptance in Supabase user metadata). Plaid Link adds its own consent screen. Optional follow-up: persist inquiry consent to a DB column for an auditable record |
| 11 | Data deletion & retention policy | ✅ built | Policy drafted + **self-service deletion implemented** (Profile → Danger Zone → `deleteMyAccount`): cascades profile/students/bookings/invoices, removes avatar + email-keyed inquiries; Stripe retains payment records. Still to do: fill retention-period placeholders; requires `SUPABASE_SERVICE_ROLE_KEY` in the server env |

**Suggested order of work:** finish these three docs (this step) → 5 + 6 + 7 confirmations (fast) → 8 (Dependabot) → 9 publish → 10 consent UI → 4 (consumer MFA, the biggest build).
