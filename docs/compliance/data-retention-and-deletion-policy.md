# Data Retention and Deletion Policy

**Organization:** ABA Music Academy (operated by [FILL-IN: legal entity name])
**Document owner:** [FILL-IN: name & title]
**Effective date:** [FILL-IN: publication date]
**Last reviewed:** July 20, 2026
**Review cadence:** At least annually.

---

## 1. Purpose

This policy defines how long ABA Music Academy retains personal information, when and how we delete it, and how deletion is honored across our systems and sub-processors. It supports our commitments in the Privacy Policy and applicable data-protection laws. The retention periods below are defaults; confirm the specific legal minimums with your accountant/counsel and adjust the `FILL-IN` items.

## 2. Principles

- **Purpose limitation.** We keep personal information only as long as it is needed for the purpose it was collected, or as required by law.
- **Minimization.** We avoid collecting or keeping data we do not need.
- **Honoring deletion.** When we delete an account, related personal data is removed from the live database, and the deletion propagates to backups and sub-processors within the timeframes below.

## 3. Retention schedule

| Data category (table) | Contains | Retention | Trigger |
|-----------------------|----------|-----------|---------|
| Account profiles (`profiles`) | Name, phone, avatar, time zone, role | While account is active + [FILL-IN: e.g., 12 months] after closure | Account deletion request or inactivity |
| Student records (`students`) | Student (often a minor) name, level, lesson notes | While enrolled + [FILL-IN: e.g., 12 months] after last lesson | Parent/guardian request or account closure |
| Inquiries (`inquiries`) | Prospect name, email, phone, student age, message | [FILL-IN: e.g., 12–24 months] if not converted to enrollment | Time-based purge |
| Bookings (`bookings`) | Lesson times, notes | Duration of enrollment + [FILL-IN] | Account closure |
| Availability (`availability`, `teacher_availability`, `availability_exceptions`) | Scheduling config (minimal personal data) | While relevant | Superseded or account closure |
| Invoices (`invoices`) | Amount, status, payment method, Stripe payment-intent ID | **[FILL-IN: typically 7 years]** for tax/accounting | Legal retention requirement |
| Notifications (`notifications`) | Titles/bodies, recipient IDs, read status | [FILL-IN: e.g., 12 months] | Time-based purge |
| Authentication data (Supabase Auth) | Email, hashed credentials, sessions | While account is active | Account deletion |
| Bank-account data via Plaid *(planned)* | Tokens/limited account info | Only while a payment method is linked; deleted on disconnect or account closure | User disconnect / closure |

> **Note on financial records:** invoice and payment records generally must be kept for tax and accounting purposes even after an account is closed. When we delete an account, we may retain the minimum invoice/payment data required by law, disassociated from other personal data where feasible. Confirm the exact period with your accountant.

## 4. Deletion procedures

### 4.1 User- or parent-requested deletion
- **Self-service:** signed-in members can delete their own account and data from the member portal (Profile → Danger Zone → Delete account). Being authenticated verifies identity; the action removes the account and, via `ON DELETE CASCADE`, the linked students, bookings, and invoices, plus the profile avatar and any inquiries submitted with the same email. Authoritative payment records remain with Stripe (Section 3). Implemented in `app/portal/profile/actions.ts::deleteMyAccount`.
- **By request:** requests may also be sent to **[FILL-IN: privacy@abamusicacademy.org]**. We verify the requester's identity/authority (a parent/guardian may request deletion of their child's data) and complete verified requests within **[FILL-IN: e.g., 30 days]**.
- Records subject to a legal-retention requirement (Section 3) are retained as noted there.

### 4.2 Account closure / inactivity
- Inactive accounts are reviewed per the retention schedule and deleted or anonymized after the stated period.

### 4.3 Backups
- Deleted data may persist in encrypted platform backups until those backups expire on their normal rotation (Supabase backup retention: [FILL-IN: confirm window for your plan]). Backups are not used to restore deleted individual records except during a disaster-recovery event.

### 4.4 Sub-processor propagation
- **Supabase:** deletion in the primary database removes live data; backups rotate out per above.
- **Stripe:** customer/payment records are retained by Stripe per Stripe's retention and legal requirements; we delete or detach references we control.
- **Plaid (planned):** on disconnect we revoke/delete access tokens so Plaid no longer shares account data with us.
- **Resend:** email delivery logs are retained by Resend per its policy; we do not send Sensitive data by email.

## 5. Legal holds

If data is subject to a legal hold, investigation, or dispute, deletion is suspended for the affected records until the matter is resolved, notwithstanding the schedule above.

## 6. Verification and review

- We periodically verify that time-based purges are running and that deletion requests are being honored end to end.
- This policy is reviewed at least annually and updated when data practices, sub-processors, or legal requirements change.

---

*Retention periods marked `FILL-IN` must be confirmed against your actual tax, accounting, and legal obligations before this policy is finalized or relied upon in an external attestation.*
