# Information Security Policy

**Organization:** ABA Music Academy (operated by [FILL-IN: legal entity name & type])
**Document owner:** [FILL-IN: name & title — the person accountable for security]
**Contact:** [FILL-IN: security@abamusicacademy.org — monitored inbox]
**Effective date:** [FILL-IN: publication date]
**Last reviewed:** July 20, 2026
**Review cadence:** At least annually, and after any material change to systems or a security incident.

---

## 1. Purpose

This policy defines how ABA Music Academy ("we," "the Studio") protects the confidentiality, integrity, and availability of the information entrusted to us — including personal information about prospective and enrolled students (some of whom are minors), their parents and guardians, and financial information used to process tuition payments. It sets the minimum security standard for everyone who accesses our systems and for the third-party services we rely on.

## 2. Scope

This policy applies to:

- All people who access Studio systems or data (the owner, teachers/staff, and any contractors).
- All systems that store or process Studio data, whether operated by us or by a sub-processor: our application code, the Supabase database and authentication, our hosting provider (Vercel), Stripe (payments), Resend (email), Google Sign-In, browser push services, and — once integrated — Plaid (bank-account connection).
- All devices used to access those systems (laptops, phones).

## 3. Roles and responsibilities

- **Security owner** ([FILL-IN: name]) is accountable for this policy, for approving access, for maintaining the sub-processor list, and for leading incident response.
- **All users** must follow this policy, use unique accounts, protect their credentials, enable multi-factor authentication where required, and report suspected security issues to the security owner without delay.
- **Sub-processors** are held to their published security commitments; we review those commitments before adopting a service and periodically thereafter (Section 9).

## 4. Data classification

We classify data into three tiers and apply controls accordingly:

| Tier | Examples | Handling |
|------|----------|----------|
| **Sensitive** | Payment/financial data, bank-account data received via Plaid, authentication credentials, children's personal information | Encrypted in transit and at rest; access limited to the minimum roles; never logged in plaintext; never placed in URLs |
| **Confidential** | Student and parent contact details, lesson notes, inquiries, invoices | Encrypted in transit and at rest; access restricted by role and Row Level Security |
| **Public** | Marketing content on the public website | No special restriction |

## 5. Identity and access management

- **Unique accounts.** Every person uses their own named account. Shared logins are prohibited.
- **Least privilege.** Access is granted based on role (`admin`, `teacher`, `student`) and reviewed when a role changes or a person leaves. Administrative access to Supabase, Vercel, Stripe, GitHub, and email is limited to those who require it.
- **Row Level Security (RLS).** RLS is enabled on all application database tables so that users can only read and write the records they are entitled to. RLS coverage is verified as part of each release that adds or changes a table.
- **Multi-factor authentication (MFA).** MFA is required for administrative access to every system that stores or processes Confidential or Sensitive data — Supabase, Vercel, GitHub, Stripe, and the email provider. *(Status: enable and enforce across all listed providers — see the gap tracker in the README before attesting to this control.)*
- **Credential hygiene.** Service keys, API keys, and secrets are stored only in the hosting provider's encrypted environment-variable store, never committed to source control. Secrets are rotated on suspected exposure and when a person with access departs.
- **Deprovisioning.** When a person leaves or no longer needs access, their accounts are disabled and their sessions revoked promptly.

## 6. Encryption

- **In transit.** All traffic between clients and our servers, and between our servers and sub-processors, uses TLS 1.2 or higher. HTTP is redirected to HTTPS; there are no plaintext data endpoints.
- **At rest.** Application data is stored in Supabase (PostgreSQL), which encrypts data at rest using AES-256. File uploads (e.g., profile avatars) are stored in Supabase Storage with encryption at rest. Payment card data is handled by Stripe and is not stored on our systems; bank-account data from Plaid will be handled per Plaid's requirements.

## 7. Secure software development

- Source code is managed in version control (GitHub) with change history.
- Dependencies are kept current; known-vulnerable packages are updated promptly. *(Status: enable automated dependency alerts — see Section 8.)*
- Secrets are never hardcoded; input from users is validated (we use schema validation) and database access is mediated by RLS.
- Changes are reviewed before reaching production wherever practical for our team size.

## 8. Vulnerability and patch management

- **Managed infrastructure.** Our database, hosting, payments, and email run on managed platforms (Supabase, Vercel, Stripe, Resend) that patch and scan their own infrastructure. We keep our accounts on supported plans and apply platform updates promptly.
- **Dependency scanning.** We enable automated dependency vulnerability alerts (e.g., GitHub Dependabot) on the application repository and remediate high-severity findings on a defined timeline. *(Status: enable if not already on.)*
- **Endpoint/device security.** Devices used to access Studio systems run a supported, patched operating system with full-disk encryption and screen-lock enabled. *(Status: confirm and document per-device — see the gap tracker for the honest scope of laptop scanning.)*
- **Remediation targets.** Critical vulnerabilities are addressed as soon as practicable; other findings are prioritized by severity.

## 9. Third-party / sub-processor management

- We maintain a current list of sub-processors that process personal data (see the Privacy Policy for the public list).
- Before adopting a sub-processor, we review its security and privacy commitments and confirm it supports encryption in transit and at rest.
- We prefer providers that hold recognized attestations (e.g., SOC 2) where available. Supabase, Vercel, Stripe, and Google publish such attestations.

## 10. Logging and monitoring

- Platform logs (authentication events, application and database logs) are retained by our providers and reviewed when investigating an issue.
- We do not log Sensitive data (passwords, full payment details, bank-account numbers) in plaintext.

## 11. Backup and recovery

- The Supabase database is backed up by the platform per its backup schedule for our plan. We confirm the backup retention window and test restore procedures periodically.
- Recovery objectives: [FILL-IN: target recovery time / recovery point, if you want to commit to specific numbers — otherwise state "restore from the most recent platform backup"].

## 12. Incident response

If a security incident or suspected data breach occurs:

1. **Report** immediately to the security owner ([FILL-IN: contact]).
2. **Contain** — revoke affected credentials/sessions, isolate affected systems.
3. **Assess** — determine what data and whose data were affected.
4. **Notify** — notify affected individuals and any required authorities within the timeframes required by applicable law; notify Plaid and other partners per our agreements with them.
5. **Remediate and review** — fix the root cause and update this policy and controls to prevent recurrence.

A record of each incident and the response is retained.

## 13. Security awareness

Everyone with access is expected to understand this policy, recognize phishing and social-engineering attempts, use MFA, and keep devices secure. This policy is reviewed with new staff/contractors before access is granted.

## 14. Policy review

This policy is reviewed at least annually and after any material system change or security incident. Changes are recorded in the "Last reviewed" date above and in version control history.

---

*This document reflects the security practices of ABA Music Academy as of the effective date. Items marked "Status:" indicate controls that are being brought fully into operation; do not represent them as complete on any external attestation until they are.*
