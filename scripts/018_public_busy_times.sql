-- 018_public_busy_times.sql
-- Narrow the public slot-availability read on `bookings` to a busy-times RPC.
--
-- Safe to run as-is in the Supabase SQL editor. Idempotent (re-runnable).
-- Requires the matching app change in this commit (three call sites move from
-- `.from("bookings")` to `.rpc("busy_lesson_times")`) — apply both together.
--
-- Background: 002 shipped
--     "Anyone can view booked lesson times" ON bookings
--       FOR SELECT USING (status IN ('pending','confirmed'))
-- so the scheduler could tell which slots are taken. The policy has no `TO`
-- clause, so it applies to every role. 006 fixed the anonymous half by
-- narrowing anon's column grant to (start_time, end_time, status), but column
-- grants are per-ROLE, not per-policy, and admins, teachers and parents all
-- share `authenticated` — which therefore keeps full-column access. Net effect
-- today: any signed-in parent can read every pending/confirmed lesson in the
-- studio, with `student_id`, `notes`, `teacher_id` (014) and the `rate_cents`
-- price snapshot (015). Verified against PostgREST with a non-admin token.
-- This is the item left open at the end of docs/compliance/rls-audit.md.
--
-- Why an RPC rather than a view: a view over `bookings` in the `public` schema
-- would have to run as its owner (`security_invoker = off`) to see past the
-- base-table RLS, which trips Supabase's `security_definer_view` advisor and
-- still hands out an unbounded read of every busy time the studio has ever
-- had. A function takes the window as an argument, so the exposure is a caller-
-- specified future range, and it follows the hygiene already established for
-- is_admin() (012/006) and current_teacher_id() (016): STABLE, SECURITY
-- DEFINER, `SET search_path = ''`.
--
-- Notes:
-- * Only start/end/status leave the function. `status` is retained because the
--   overlap check in lib/schedule.ts skips cancelled lessons, and because anon
--   can already see it today — this is not a widening.
-- * `p_from` is a REQUIRED argument with no `now()` default on purpose. Lesson
--   times are studio wall-clock stored as-if-UTC (lib/studio-time.ts), so the
--   database's `now()` is the wrong clock; callers pass `studioNow()`.
-- * `p_exclude_booking_id` serves the parent reschedule flow, which must ignore
--   the lesson being moved. Passing an arbitrary id reveals nothing: no ids are
--   returned, and excluding a row can only ever make the caller's own overlap
--   check stricter about itself.
-- * EXECUTE stays granted to anon/authenticated — that is the point of the
--   function, and it is the same carve-out documented in 012/016.
-- * Parents keep 002's "Parents can view their children bookings" (their own
--   lessons, all columns), teachers keep 016's scoped policy, admins keep
--   is_admin(). Only the studio-wide row grant goes away.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- Busy time ranges for a forward-looking window. Nothing identifying.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.busy_lesson_times(
  p_from TIMESTAMPTZ,
  p_to TIMESTAMPTZ DEFAULT NULL,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS TABLE (start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, status TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT b.start_time, b.end_time, b.status
  FROM public.bookings b
  WHERE b.status IN ('pending', 'confirmed')
    AND b.start_time >= p_from
    AND (p_to IS NULL OR b.start_time < p_to)
    AND (p_exclude_booking_id IS NULL OR b.id <> p_exclude_booking_id)
  ORDER BY b.start_time;
$$;

REVOKE EXECUTE ON FUNCTION public.busy_lesson_times(TIMESTAMPTZ, TIMESTAMPTZ, UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.busy_lesson_times(TIMESTAMPTZ, TIMESTAMPTZ, UUID) TO anon, authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- Retire the studio-wide row grant it replaces.
-- ────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view booked lesson times" ON public.bookings;

-- With the policy gone, 006's anon column grant selects zero rows. Drop it
-- rather than leave a dangling privilege: anon now reaches bookings only
-- through busy_lesson_times(), and has no other business on the table.
REVOKE ALL ON public.bookings FROM anon;

commit;

-- ── Verification (run these separately after applying) ───────────────────────
-- 1. The function returns busy ranges and nothing else:
--      select * from busy_lesson_times(now() - interval '1 year') limit 5;
--      -- expect: start_time, end_time, status columns only
--
-- 2. As a NON-ADMIN parent's token (not the service role), the leak is closed.
--    Before this migration the first query returned every lesson in the studio:
--      select count(*) from bookings;
--      -- expect: only that parent's own children's lessons
--      select count(*) from bookings where student_id <> '<their student id>';
--      -- expect: 0
--    and the replacement still works:
--      select count(*) from busy_lesson_times(now());   -- expect: all busy slots
--
-- 3. As anon (the publishable key):
--      select start_time from bookings;
--      -- expect: ERROR permission denied for table bookings
--      select count(*) from busy_lesson_times(now());
--      -- expect: the same busy-slot count as (2)
--
-- 4. No policy left on bookings grants a studio-wide read:
--      select polname, pg_get_expr(polqual, polrelid) as qual
--      from pg_policy where polrelid = 'public.bookings'::regclass and polcmd = 'r';
--      -- expect: parent (parent_id), teacher (current_teacher_id), admin (is_admin) only
--
-- 5. Admin, teacher and parent surfaces are untouched — /admin/schedule,
--    /dashboard and /portal/schedule still list lessons, and the two booking
--    flows still reject a taken slot: submit an inquiry on an occupied time
--    (/inquire) and reschedule onto one (/portal/schedule). Both must return
--    "That time is no longer available."
