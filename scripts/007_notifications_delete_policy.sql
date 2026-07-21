-- 007_notifications_delete_policy.sql
-- Bug fix found during the RLS audit (docs/compliance/rls-audit.md).
--
-- The `notifications` table has RLS enabled but NO delete policy, so RLS
-- default-denies deletes. app/admin/notifications/actions.ts::deleteNotification
-- runs as the `authenticated` role, so its `.delete()` silently affects 0 rows —
-- admins appear to delete a notification but it persists.
--
-- Fix: add an admin-only DELETE policy, matching the pattern used for the other
-- admin-managed tables in 002_rls_policies.sql (students, availability, bookings,
-- inquiries all use `FOR DELETE USING (is_admin())`).
--
-- Safe to run as-is in the Supabase SQL editor. Idempotent. No app changes.
-- `authenticated` already holds the DELETE table grant; this policy gates it.

begin;

drop policy if exists "Admins can delete notifications" on public.notifications;
create policy "Admins can delete notifications" on public.notifications
  for delete using (public.is_admin());

commit;

-- ── Verification ─────────────────────────────────────────────────────────────
-- As an admin, deleting a notification from /admin/notifications should now
-- remove the row. Confirm the policy exists:
--   select policyname, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'notifications'
--   order by cmd, policyname;
