# Plaid Questionnaire — Pre-Submission Checklist

**Last updated:** August 3, 2026
**Purpose:** everything that must happen *before* submitting the Plaid security questionnaire, in order, plus the honest answer to give for each question once the prerequisites are done.

Everything code-side is already built (see [README.md](README.md) for the item-by-item tracker). What remains is **owner action** — settings, accounts, placeholders, and legal review.

---

## Part A — Do these first (in order)

### 1. Apply the database migrations  ·  ✅ DONE 2026-08-03
- [x] Run [`scripts/006_rls_hardening.sql`](../../scripts/006_rls_hardening.sql) — applied via MCP `apply_migration`, tracked in Supabase migration history
- [x] Run [`scripts/007_notifications_delete_policy.sql`](../../scripts/007_notifications_delete_policy.sql) — applied
- [x] Run [`scripts/008_notifications_revoke_anon_update.sql`](../../scripts/008_notifications_revoke_anon_update.sql) — follow-up found during rollout (the mark-as-read policy had no `TO` clause, so anon held a usable all-column UPDATE grant); applied
- [x] Verification queries — confirmed against the live catalog: `is_admin` search_path pinned, anon bookings SELECT limited to start/end/status, authenticated notifications UPDATE limited to `is_read_by`, anon UPDATE revoked, auth-gated SELECT policy, admin DELETE policy present
- [x] Security Advisor run — the audit's RLS findings are cleared. It surfaced three small hygiene items, none blocking:
  - [ ] Pin `search_path` on `public.update_updated_at_column` (same class as F3)
  - [ ] Enable leaked-password protection (Auth → password security — one toggle)
  - [ ] Revoke anon/authenticated `EXECUTE` on `is_admin()` / `handle_new_user()` RPC endpoints

### 2. Create the security contact  ·  ~15 min  (Q1)
- [ ] Create a **monitored** group alias — `security@abamusicacademy.org` (and ideally `privacy@…`)
- [ ] Decide whose name + title goes on the form (e.g., "Arpine [surname], Owner")

### 3. Work the MFA checklist  ·  ~1–2 hrs  (Q5)
- [ ] Complete every box in [mfa-checklist.md](mfa-checklist.md) — order matters: **email first, then domain registrar**, then GitHub / Vercel / Supabase / Stripe / Resend
- [ ] Screenshot each provider's security page as evidence

### 4. Fill the placeholders  ·  ~30 min
- [ ] `grep -rn "FILL-IN" docs/compliance` and replace every one (legal entity name, address, retention periods, contact inboxes, dates)
- [ ] Same for the two highlighted brackets rendered on the `/privacy` page

### 5. Legal review, then publish the privacy policy  (Q9)
- [ ] Counsel reviews [privacy-policy.md](privacy-policy.md) (children's data / COPPA + CCPA applicability are the two flagged questions)
- [ ] After sign-off, in [`app/(public)/privacy/page.tsx`](../../app/(public)/privacy/page.tsx): remove the **draft banner**, the `robots` **noindex**, and the `<Fill>` placeholders; set the effective date

### 6. Verify the two flows once with a throwaway account
- [ ] Sign up a test account → confirm the consent checkbox gates it (Q10)
- [ ] Delete that account via Profile → Danger Zone → confirm profile/students rows are gone (Q11). Requires `SUPABASE_SERVICE_ROLE_KEY` in the Vercel env — confirm it's set
- [ ] Cross-tenant test while you're at it: with two test parent accounts, confirm neither can read the other's students/invoices (closes the RLS audit's open item, Q3)

### 7. Merge to main  ·  ✅ DONE 2026-08-03
- [x] Merged (PR #21); npm/pnpm lockfile standardized (PR #22)
- [x] Dependabot ran and was worked through: **19 alerts (10 high) → 0** (PR #38); weekly grouped updates merged (PRs #40/#41); 24 unused packages removed, runtime deps 51→27 (PR #42). Deferred majors left open deliberately: eslint 10, TypeScript 7, sonner 2, stripe 22 (bundle the stripe review into the Plaid build)

### 8. Decide the endpoint posture  ·  a decision, not a build  (Q8)
- [ ] For a studio this size, an honest stance is: company/work devices run a supported, auto-updating OS with full-disk encryption + screen lock. Write it into the Infosec Policy §8 and answer Q8 with only what's true

### 9. Later — with the Plaid integration  (Q4)
- [ ] Build the consumer MFA step-up gate per [consumer-mfa-plan.md](consumer-mfa-plan.md) (TOTP, gate at Plaid Link, ~0.5–1 day of the Plaid build). **Q4 must be answered "No / planned" until this ships.**

---

## Part B — Answer key (honest, once Part A is done)

| # | Question | Answer to give |
|---|----------|----------------|
| 1 | Security contact | [Name], [Title] — `security@abamusicacademy.org` (monitored) |
| 2 | Documented + operationalized infosec policy | **Yes** once A1–A3 are done — attach [information-security-policy.md](information-security-policy.md) |
| 3 | Access controls | Select: role-based access control · least privilege · unique accounts · encryption. Evidence: [rls-audit.md](rls-audit.md) — hardening migrations 006–008 applied to production 2026-08-03 |
| 4 | Consumer MFA before Plaid Link | **"Planned — TOTP step-up gate at Plaid Link launch, shipping with the integration."** Do not say "yes" before it ships |
| 5 | MFA on critical internal systems | **Yes** once A3 is complete (screenshots as evidence) |
| 6 | TLS 1.2+ in transit | **Yes** — Vercel-terminated TLS; Supabase/Stripe APIs over TLS |
| 7 | Encryption at rest | **Yes** — Supabase Postgres AES-256; card data held by Stripe, not us |
| 8 | Vulnerability scanning | Production/deps: **Yes** — Dependabot alerts + security updates + weekly version updates, with a demonstrated triage cycle (19 alerts → 0, 2026-08-03) and a minimized dependency surface. Endpoints: state exactly the posture chosen in A8 |
| 9 | Privacy policy | **Yes** — link `https://abamusicacademy.org/privacy` (after A5 publishes it) |
| 10 | Consumer consent | **Yes** — consent checkbox at sign-up (recorded in user metadata with timestamp) and at inquiry (server-enforced); Plaid Link presents its own consent |
| 11 | Retention & deletion policy | **Yes** — attach [data-retention-and-deletion-policy.md](data-retention-and-deletion-policy.md); self-service deletion is live in the member portal |

**The one blocker to watch:** Q4. Every other item closes with Part A; Q4 stays "planned" until the Plaid integration (with its MFA gate) actually ships. If Plaid requires a "yes" before granting production access, the MFA primitives may need to ship first — the plan supports that (items #2–#5 are Plaid-independent).
