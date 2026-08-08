-- 013_attendance_fn_hygiene.sql
-- Companion to 012_function_hygiene.sql: the post-012 Security Advisor run
-- surfaced the same RPC-exposure lint (0028/0029) for the attendance trigger
-- function added by 009_billing_attendance.sql.
--
-- enforce_attendance_admin_only() is a pure trigger function (RETURNS trigger,
-- exactly one trigger use, zero RLS policy references, search_path already
-- pinned). Trigger firing does not check the DML role's EXECUTE at fire time,
-- so revoking the default PUBLIC grant only removes the
-- /rest/v1/rpc/enforce_attendance_admin_only endpoint; the attendance
-- admin-only enforcement keeps working unchanged.

begin;

revoke execute on function public.enforce_attendance_admin_only() from public, anon, authenticated;

commit;

-- ── Verification ─────────────────────────────────────────────────────────────
--   select coalesce(array_to_string(p.proacl::text[], ' | '), 'default(PUBLIC)') as acl
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and p.proname = 'enforce_attendance_admin_only';
-- Expect no anon/authenticated entries. Re-run Database → Advisors →
-- Security Advisor: only the two documented is_admin warnings and the
-- leaked-password toggle should remain.
