-- 008_notifications_revoke_anon_update.sql
-- Follow-up to F1 (006_rls_hardening.sql), found while applying it on 2026-07-21.
--
-- "Users can mark notifications as read" (002_rls_policies.sql) was created
-- without a TO clause, so its USING (true) applies to ALL roles — including
-- anon — and anon holds the default all-column UPDATE grant on notifications.
-- 006 narrowed the *authenticated* role's UPDATE to is_read_by but left anon
-- untouched, so a logged-out visitor can still issue a filter-less UPDATE
-- (no WHERE clause reads no rows, so the auth-gated SELECT policy never
-- applies) that rewrites every notification's title/body. Anonymous visitors
-- have no legitimate update path to notifications at all.
--
-- Two layers, both idempotent, no app-code changes:
--   1. Revoke the anon UPDATE grant (the actual fix).
--   2. Re-create the mark-as-read policy scoped TO authenticated, making the
--      intended audience explicit at the policy level too.
--
-- Safe to run as-is in the Supabase SQL editor.

begin;

revoke update on public.notifications from anon;

drop policy if exists "Users can mark notifications as read" on public.notifications;
create policy "Users can mark notifications as read" on public.notifications
  for update to authenticated using (true);

commit;

-- ── Verification (run separately after applying) ─────────────────────────────
-- 1. As anon, this must fail with "permission denied for table notifications"
--    (touches no rows either way — WHERE false):
--      set role anon;
--      update public.notifications set title = 'x' where false;
-- 2. The policy is now scoped:
--      select policyname, roles, cmd from pg_policies
--      where schemaname = 'public' and tablename = 'notifications'
--      order by cmd, policyname;
--    Expect "Users can mark notifications as read" to show roles={authenticated}.
