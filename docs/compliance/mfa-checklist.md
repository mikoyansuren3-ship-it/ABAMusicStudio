# MFA Enablement Checklist (Questionnaire Q5)

**Goal:** enforce multi-factor authentication (MFA) on every system that stores or processes consumer or financial data, or that could be used to reach one. This is administrator/operator access — not the consumer-facing MFA in Q4.

**Owner:** [FILL-IN: name] · **Target completion:** [FILL-IN: date] · **Last updated:** July 20, 2026

---

## Principles (apply to every system below)

- **Prefer an authenticator app (TOTP) or a passkey / hardware security key.** Avoid SMS as your only second factor — it is phishable and vulnerable to SIM-swap. Use SMS only as a backup if nothing else is available.
- **Save backup / recovery codes** for each account in a password manager (not in email, not in the repo).
- **Use a password manager** with unique, strong passwords for every service.
- **Do the recovery roots first.** Email and your domain registrar can reset or intercept logins for everything else — secure them before the rest.
- **If a service has a team/org, enforce MFA org-wide**, don't rely on each person enabling it individually.

---

## The checklist (priority order)

### 1. Email — the recovery root
Every other service resets its password through email, so this comes first.
- [ ] Enable 2-Step Verification on the Google account behind **arpine@abamusicacademy.org** (Google Account → Security → 2-Step Verification). Prefer an authenticator app or passkey.
- [ ] Enable 2FA on any personal Google account used for admin (e.g. the account that owns these services).
- [ ] Save backup codes.
- [ ] If email is on Google Workspace with multiple users, enforce 2FA for all users (Admin console → Security → Authentication → 2-Step Verification → Enforce).

### 2. Domain registrar / DNS for abamusicacademy.org
Whoever controls DNS controls your email and can hijack the domain.
- [ ] Log in to the registrar/DNS host for **abamusicacademy.org** and enable 2FA on that account.
- [ ] Turn on domain registrar lock if available.

### 3. GitHub (source code + any CI secrets)
- [ ] Enable 2FA on the **mikoyansuren3-ship-it** account (Settings → Password and authentication → Two-factor authentication). Use a TOTP app or passkey/security key.
- [ ] Save recovery codes.
- [ ] If the repo moves under a GitHub **organization** later, require 2FA for all members (Org → Settings → Authentication security → "Require two-factor authentication").

### 4. Vercel (hosting + environment variables / secrets)
- [ ] Enable 2FA on the Vercel account (Account Settings → Authentication / Security).
- [ ] If this project is under a Vercel **Team**, enforce 2FA for all team members (Team Settings → Security).

### 5. Supabase (database with consumer data + payment references, and auth)
- [ ] Enable MFA on the Supabase dashboard account (Account → Security → enable authenticator app / 2FA).
- [ ] If the project belongs to a Supabase **Organization** with members, require MFA org-wide (Organization → Settings → require MFA for members).

### 6. Stripe (payment processing)
- [ ] Confirm 2FA is enabled on your Stripe account (Stripe requires it for dashboard login; verify it's a TOTP app or security key, not SMS-only).
- [ ] If you have Stripe **team members**, require 2FA for the team (Settings → Team and security).

### 7. Resend (transactional email delivery)
- [ ] Enable 2FA on the Resend account (Account/Settings → Security).

### 8. Plaid dashboard (once you create it, before go-live)
- [ ] Enable MFA on the Plaid dashboard account that manages your API keys and consumer bank data.
- [ ] If multiple people have access, enforce MFA for all team members.

---

## Evidence for the questionnaire

For each system, capture proof that MFA is on (and, where applicable, enforced for all members): a screenshot of the security settings page showing MFA enabled / enforcement turned on. Keep these together so you can answer Q5 truthfully and support it if Plaid asks.

Once every box above is checked, **Q5's honest answer becomes "Yes"** — MFA is in place for access to the critical systems that store or process consumer financial data.

## Ongoing

- Review this list whenever you add a new service that touches consumer or financial data.
- When someone leaves, remove their access and confirm no shared/MFA-less accounts remain.
- Re-confirm enforcement settings during your annual security review (see the Information Security Policy).
