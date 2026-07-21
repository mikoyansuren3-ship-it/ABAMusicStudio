-- 006_rls_hardening.sql
-- Hardening fixes for findings F1–F4 in the RLS audit (docs/compliance/rls-audit.md).
--
-- Safe to run as-is in the Supabase SQL editor. It is idempotent (re-runnable)
-- and requires NO application code changes — it was written against the actual
-- usage in app/portal/notifications/actions.ts, app/admin/notifications/actions.ts,
-- and app/api/availability/route.ts.
--
-- Why column privileges: PostgreSQL RLS controls WHICH ROWS a role can touch, but
-- not WHICH COLUMNS. F1 and F2 are column-exposure problems, so the correct tool
-- is per-column GRANT/REVOKE, not a policy change.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- F3 (Low) — Pin search_path on the SECURITY DEFINER helper.
-- Clears Supabase's "Function Search Path Mutable" advisory and prevents
-- search_path injection. With an empty search_path every object must be
-- schema-qualified (public.profiles, auth.uid()).
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- F1 (Medium) — Stop any signed-in user from editing arbitrary notification
-- columns. Every logged-in user shares the `authenticated` role, and the only
-- legitimate update they make is marking a notification read (is_read_by).
-- Restrict their UPDATE to that one column. Admins create/delete notifications
-- (never update), and `service_role` is left untouched, so nothing breaks.
--
-- Residual (acceptable): a user can still write any value to is_read_by on any
-- notification. If you want to close that too, replace the mark-as-read calls
-- with a SECURITY DEFINER RPC that only appends auth.uid(). Not required here.
-- ────────────────────────────────────────────────────────────────────────────
revoke update on public.notifications from authenticated;
grant update (is_read_by) on public.notifications to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- F2 (Low–Med) — Stop anonymous visitors from reading booking `notes` and
-- `student_id`. The public availability calendar only needs busy times, so the
-- anon role gets column access to start/end/status only. Authenticated roles
-- (parents/teachers/admins) keep full column access, gated by their existing
-- row policies. The "Anyone can view booked lesson times" row policy is kept.
-- ────────────────────────────────────────────────────────────────────────────
revoke select on public.bookings from anon;
grant select (start_time, end_time, status) on public.bookings to anon;

-- ────────────────────────────────────────────────────────────────────────────
-- F4 (Low) — Require authentication to read broadcast (audience='all')
-- notifications. Previously a logged-out visitor could read them. The portal
-- reads notifications only as an authenticated user, so this is transparent.
-- ────────────────────────────────────────────────────────────────────────────
drop policy if exists "Users can view their notifications" on public.notifications;
create policy "Users can view their notifications" on public.notifications
  for select using (
    (
      auth.uid() is not null
      and (audience = 'all' or auth.uid() = any(recipient_ids))
    )
    or public.is_admin()
  );

commit;

-- ── Verification (run these separately after applying) ───────────────────────
-- 1. As the anon (publishable) key, these must be blocked / empty:
--      select notes from bookings;      -- expect: ERROR permission denied for column notes
--      select student_id from bookings; -- expect: ERROR permission denied for column student_id
--      select * from notifications;     -- expect: 0 rows
-- 2. Column grants now in effect:
--      select grantee, table_name, string_agg(column_name, ', ' order by column_name) as cols, privilege_type
--      from information_schema.column_privileges
--      where table_name in ('bookings','notifications')
--        and grantee in ('anon','authenticated')
--      group by grantee, table_name, privilege_type
--      order by table_name, grantee, privilege_type;
-- 3. Re-run the anon probe from the audit and the dashboard Security Advisor
--    (Database → Advisors) to confirm a clean result.
