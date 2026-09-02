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
| teachers (pay rates; added `014`, 2026-08-07) | 0 | 0 (admin-only, anon revoked) | ✅ protected |
| student_slots (added `014`, 2026-08-07) | 0 | 0 (admin-only, anon revoked) | ✅ protected |
| notifications | 0 | 0 / broadcast only | ✅ (see F4) |
| bookings | 0 | busy slots only | ✅ now (see F2, F7) |
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

---

## Remediation status — 2026-08-03

All findings are **fixed in production**. Migrations applied via the Supabase MCP `apply_migration` (so they appear in the project's migration history) and verified against the live catalog afterward.

| Finding | Fix | Status |
|---------|-----|--------|
| F1 notifications UPDATE over-permissive | `006` — authenticated UPDATE grant narrowed to `is_read_by` | ✅ applied + verified |
| F2 bookings anon SELECT over-broad | `006` — anon SELECT grant narrowed to `start_time, end_time, status` (matches the two anon read sites) | ✅ applied + verified |
| F3 `is_admin()` mutable search_path | `006` — `search_path = ''` pinned; advisor warning cleared | ✅ applied + verified |
| F4 broadcasts readable logged-out | `006` — SELECT policy now requires `auth.uid() IS NOT NULL` | ✅ applied + verified (anon probe: 0 rows) |
| F5 missing notifications DELETE policy | `007` — admin-only DELETE policy added | ✅ applied + verified |
| **F6 (new)** anon could UPDATE notifications | `008` — found during rollout: the mark-as-read policy was created **without a `TO` clause**, so its `USING (true)` applied to *all* roles, and anon held the default all-column UPDATE grant — a logged-out visitor could issue a filter-less UPDATE rewriting any notification. `008` revokes anon's UPDATE grant and re-creates the policy `TO authenticated` | ✅ applied + verified (only remaining UPDATE grant: `authenticated → is_read_by`) |

Security Advisor re-run after the migrations: the audit's findings are cleared. Three unrelated hygiene items remain open (tracked in [plaid-submission-checklist.md](plaid-submission-checklist.md) A1): `update_updated_at_column` mutable search_path, leaked-password protection disabled, and anon/authenticated `EXECUTE` on the `is_admin()`/`handle_new_user()` RPC endpoints.

**Update 2026-08-07:** migration `014` (teachers + multi-slot scheduling) added two admin-only tables — `teachers`, `student_slots` — using the `009` pattern (`FOR ALL USING (public.is_admin())` + anon REVOKE), a guarded `bookings.teacher_id` column (guard trigger `enforce_booking_teacher_admin_only`, RPC EXECUTE revoked per `012`/`013` hygiene), and `students.contact_email`/`students.teacher_id`. Advisor re-run after applying: no new warnings (the new guard function does NOT appear in the SECURITY DEFINER lint, confirming the revoke).

**Update 2026-08-31:** migrations `016` (teacher-scoped access) and `017` (teacher attendance) activated teacher logins, which until now saw the whole studio. Changes, all verified with a real teacher session token against PostgREST (not the service role):

- `students` / `bookings`: 002's blanket `"Teachers can view all ..."` policies are replaced by scoped ones. A teacher login resolves to a roster row through `teachers.profile_id` (`current_teacher_id()`), and sees only students they teach — any weekly slot of theirs, or the student's default teacher when there are no slots (`teacher_teaches_student()`). Probe: 6 of 36 students visible, matching the admin roster rule exactly.
- `teachers` gains a SELECT policy for a teacher's **own** row (`profile_id = auth.uid()`); it remains admin-only for everything else, and pay rates for other teachers stay unreadable. A unique partial index keeps the login ↔ roster row mapping one-to-one.
- `bookings` gains a teacher UPDATE policy scoped to `teacher_id`, so a teacher can mark attendance on their own lessons. Two triggers bound it: the `009`/`010` attendance guard now also accepts the lesson's teacher of record, and `enforce_teacher_attendance_columns_only` rejects any teacher edit that touches student, teacher, times, or status (parents are exempted — they legitimately reschedule their own children's bookings). Probes: cancelling own lesson → `Teachers can only update lesson attendance`; marking another teacher's lesson → 0 rows.
- `inquiries`: the teacher SELECT/UPDATE policies from `002` are dropped — inquiries are an admin surface. Probe as teacher: 0 rows.
- Both new lookups are SECURITY DEFINER with `search_path = ''`, and keep `EXECUTE` for anon/authenticated under the documented `is_admin()` carve-out from `012` (RLS evaluates them as the querying role).

**F7 (new) — `bookings` studio-wide SELECT for authenticated users · Medium.** Found while auditing `016`: 002's `"Anyone can view booked lesson times"` policy (`USING (status IN ('pending','confirmed'))`) has no `TO` clause, so it applies to every role. `006` fixed the anonymous half with a column grant, but column grants are per-role and admins, teachers and parents all share `authenticated` — which keeps full-column access. Any signed-in parent could therefore read every pending/confirmed lesson in the studio (251 rows), with `student_id`, `notes`, `teacher_id` (`014`) and the `rate_cents` price snapshot (`015`). Confirmed against `/rest/v1/bookings` with a non-admin user's token. Not an unauthenticated exposure, but well past what slot-availability needs.

**Fix — migration [`018_public_busy_times.sql`](../../scripts/018_public_busy_times.sql) (+ matching app change).** The policy is dropped and replaced by `busy_lesson_times(p_from, p_to, p_exclude_booking_id)`, a STABLE SECURITY DEFINER function with `search_path = ''` returning only `start_time`, `end_time`, `status` for a caller-specified forward window. A view was rejected: it would need `security_invoker = off` to see past base-table RLS (tripping the `security_definer_view` advisor) and would still expose every busy time ever recorded, unbounded. `p_from` deliberately has no `now()` default — lesson times are studio wall-clock stored as-if-UTC, so the database clock is the wrong one; callers pass `studioNow()`. Anon's `006` column grant is revoked outright, since the RPC is now its only route to the table. Three call sites move to the RPC: `app/api/availability/route.ts`, `app/(public)/inquire/actions.ts`, and `rescheduleBooking` in `app/portal/schedule/actions.ts` (which passes `p_exclude_booking_id` so the lesson being moved does not overlap itself). Parent (`parent_id`), teacher (`016`) and admin (`is_admin()`) SELECT policies are untouched. **Status: written, not yet applied — run in the Supabase SQL editor and work through the migration's verification block.**

Noted in passing, not a security issue: `/portal/schedule` renders the parent's reschedule calendar from their own student's bookings alone, so it under-draws studio-wide busy slots. The authoritative overlap check has always been the server action, which now sees all of them via the RPC.

Still outstanding from the Limitations section: the **authenticated cross-tenant test** (two parent accounts confirming neither reads the other's students/invoices) — checklist step A6.
