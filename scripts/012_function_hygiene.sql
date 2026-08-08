-- 012_function_hygiene.sql
-- Security Advisor hygiene items from the 2026-08-03 run (tracked in
-- docs/compliance/plaid-submission-checklist.md, step A1).
-- Applied to production 2026-08-03 as migration 012_function_hygiene.
--
-- 1. update_updated_at_column — pin search_path (lint 0011, "Function Search
--    Path Mutable"). The body only calls NOW() (pg_catalog), so an empty
--    search_path is safe.
-- 2. handle_new_user — remove PostgREST RPC exposure (lints 0028/0029).
--    Functions default-grant EXECUTE to PUBLIC, which is what exposed
--    /rest/v1/rpc/handle_new_user. Trigger firing does NOT check the DML
--    role's EXECUTE at fire time, so the auth.users signup trigger keeps
--    working; supabase_auth_admin gets an explicit grant as belt-and-braces.
-- 3. is_admin — NOT revoked; accepted and documented. RLS policies evaluate
--    is_admin() AS the querying role (anon/authenticated), so those roles
--    must keep EXECUTE or every policy that references it (notifications,
--    bookings, availability, ...) errors instead of filtering. The RPC
--    exposure is benign: no arguments, no side effects, and it returns only
--    whether the CALLER is an admin — a user's own role is not a secret to
--    them. The advisor's two is_admin warnings are expected to remain.

begin;

alter function public.update_updated_at_column() set search_path = '';

revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

commit;

-- ── Verification ─────────────────────────────────────────────────────────────
--   select p.proname,
--          coalesce(array_to_string(p.proconfig, ';'), 'none') as config,
--          coalesce(array_to_string(p.proacl::text[], ' | '), 'default(PUBLIC)') as acl
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public'
--     and p.proname in ('update_updated_at_column', 'handle_new_user');
-- Expect: search_path="" on update_updated_at_column; handle_new_user ACL
-- limited to postgres / service_role / supabase_auth_admin.
-- Then verify a real signup still creates a profiles row (checklist A6's
-- throwaway-account test covers this).
