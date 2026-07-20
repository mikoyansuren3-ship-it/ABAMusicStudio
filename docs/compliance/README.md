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
| 3 | Access controls to prod & sensitive data | 🟡 | Confirm RLS is enabled on **every** table with data; document least-privilege for Supabase/Vercel/Stripe |
| 4 | MFA for consumers before Plaid Link | 🔴 | Not built. Decide: enforce app-level MFA, or rely on Plaid's own consumer auth. Likely required |
| 5 | MFA for internal access to financial-data systems | 🟡 | Turn on + enforce MFA on Supabase, Vercel, GitHub, Stripe, and email. Quick win |
| 6 | TLS 1.2+ in transit | ✅ | Provided by Vercel + Supabase/Stripe APIs. Confirm no plain-HTTP endpoints |
| 7 | Consumer data encrypted at rest | ✅ | Supabase Postgres = AES-256 at rest. Confirm Plaid data will live there |
| 8 | Vulnerability scanning (endpoints + prod) | 🟡→✅ (deps) | Dependabot alerts + security updates **enabled** on the repo; `.github/dependabot.yml` adds weekly version updates (takes effect once merged to main). Managed platforms (Supabase/Vercel/Stripe) scan their own infra. **Still open:** endpoint/laptop posture — decide + document |
| 9 | Privacy policy where Link is deployed | 📄 | Draft ready; legal review, then publish at `/privacy` and link it |
| 10 | Consumer consent for collection/processing | ✅ | Consent checkbox linking the Privacy Policy added to sign-up and inquiry forms (client gate + server check; sign-up records acceptance in Supabase user metadata). Plaid Link adds its own consent screen. Optional follow-up: persist inquiry consent to a DB column for an auditable record |
| 11 | Data deletion & retention policy | 📄 | Draft ready; implement the deletion workflow it describes |

**Suggested order of work:** finish these three docs (this step) → 5 + 6 + 7 confirmations (fast) → 8 (Dependabot) → 9 publish → 10 consent UI → 4 (consumer MFA, the biggest build).
