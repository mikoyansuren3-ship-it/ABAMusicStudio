# Row Level Security (RLS) Audit — Questionnaire Q3

**Date:** July 20, 2026
**Scope:** `public` schema of the production Supabase project (`yzazaijzcclqgxhjlruk`).
**Auditor:** automated review (static policy review + live black-box probe).

---

## Method

Two independent checks:

1. **Static review** of the declared policies in [`scripts/002_rls_policies.sql`](../../scripts/002_rls_policies.sql) against the schema in `scripts/001_create_schema.sql`.
2. **Live black-box probe** of the production REST API using the **publishable (anon) key** — i.e. exactly what a logged-out attacker can do. Requests pulled only the `id` column, so no PII was retrieved. If RLS were disabled or misconfigured on a table, the anon role would receive its rows.

## Headline result — PASS for sensitive data

All 10 tables have RLS enabled with policies, and the live probe confirms an **anonymous user cannot read any sensitive table**:

| Table | Rows visible to anonymous | Expected | Verdict |
|-------|---------------------------|----------|---------|
| profiles | 0 | 0 (owner-only) | ✅ protected |
| students (minors' data) | 0 | 0 | ✅ protected |
| invoices (financial) | 0 | 0 | ✅ protected |
| inquiries (contact + child age) | 0 | 0 | ✅ protected |
| teacher_availability | 0 | 0 | ✅ protected |
| notifications | 0 | 0 / broadcast only | ✅ (see F4) |
| bookings | 0 | busy slots only | ✅ now (see F2) |
| availability | 3 | public calendar | ✅ intended |
| availability_exceptions | 0 | public | ✅ intended |
| studio_settings | 3 | public | ✅ intended |

**Q3 answer is a verifiable "Yes":** access to production data is controlled by role-based Row Level Security, and PII/financial tables are not readable without authentication and authorization. Select the controls that apply: role-based access control (admin/teacher/student), least privilege via per-row ownership (`parent_id = auth.uid()`), and RLS on every table.

## Findings (hardening — none are open data leaks today)

### F1 — `notifications` UPDATE policy is over-permissive  · Medium
`"Users can mark notifications as read" ON notifications FOR UPDATE USING (true)` lets **any authenticated user update any notification row**. RLS cannot restrict *which columns* an UPDATE touches, so a signed-in user could alter a notification's `title`, `body`, `audience`, or `recipient_ids`, not just mark it read.
**Fix:** move mark-as-read to a `SECURITY DEFINER` RPC that only appends the caller's id to `is_read_by`, and drop the blanket `USING (true)` UPDATE policy.

### F2 — `bookings` public SELECT exposes more than "busy time" · Low–Medium
`"Anyone can view booked lesson times" ... USING (status IN ('pending','confirmed'))` returns **all columns** of matching rows to anonymous users, including `notes` and `student_id`. Intended use is showing busy slots on the public calendar. (Zero rows today, so nothing is currently exposed, but it is structurally over-broad.)
**Fix:** expose only start/end/status via a dedicated view or API, and restrict or remove the table-level anon SELECT.

### F3 — `is_admin()` is SECURITY DEFINER without a fixed `search_path` · Low
The helper runs as its owner but does not pin `search_path`, the "Function Search Path Mutable" issue Supabase's own advisor flags. It is a privilege-escalation hardening gap.
**Fix:** `ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;` (and schema-qualify `profiles` → `public.profiles`).

### F4 — Broadcast notifications are readable by logged-out visitors · Low / informational
The notifications SELECT policy allows anyone (including anon) to read rows where `audience = 'all'`. If broadcasts are meant for signed-in members only, add an `auth.uid() IS NOT NULL` condition. (Zero broadcast rows today.)

### F5 — `notifications` has no DELETE policy (functionality bug) · Low
Found while reviewing the notifications policies: the table has RLS enabled but **no DELETE policy**, so RLS default-denies deletes. `app/admin/notifications/actions.ts::deleteNotification` runs as `authenticated`, so its delete silently affects 0 rows — admins appear to delete a notification but it persists. Not a security exposure (under-permissive, not over-permissive), but a correctness gap.
**Fix:** [`scripts/007_notifications_delete_policy.sql`](../../scripts/007_notifications_delete_policy.sql) adds an admin-only DELETE policy.

## Limitations of this audit (what still needs a human/authoritative check)

- **Authenticated cross-tenant isolation was not tested.** The probe used the anon role only. The policies *look* correctly scoped (`parent_id = auth.uid()`), but proving parent A cannot read parent B's `students`/`invoices` needs two real authenticated sessions. Recommended before go-live.
- **Catalog-level enumeration was unavailable.** The Supabase MCP server is not authenticated in this environment and `psql` is not installed, so I could not list every table/`rls_enabled` flag directly or run the built-in advisors. **Recommended:** run the dashboard's **Security Advisor** (Database → Advisors) or authenticate the Supabase MCP/CLI for a catalog-level confirmation and to auto-detect any table added since `002_rls_policies.sql`.
- **Empty-table caveat.** A "0 rows to anon" result is only conclusive when the table has data. `profiles`, `studio_settings`, and `availability` clearly do (the app has users and seed data), so the result is trustworthy for the sensitive tables.

## Recommended next step

Fixes for **F1–F4** are written up as [`scripts/006_rls_hardening.sql`](../../scripts/006_rls_hardening.sql) — a pure-SQL, idempotent migration requiring no app-code changes. **Run it in the Supabase SQL editor**, then re-run the anon probe and the dashboard Security Advisor (Database → Advisors) to confirm a clean bill of health. Also run the authenticated cross-tenant test noted under Limitations before go-live.
