-- 009_billing_attendance.sql
-- Income ledger: per-student billing terms + per-lesson attendance.
--
-- Safe to run as-is in the Supabase SQL editor. Idempotent (re-runnable).
-- Billing lives in its own admin-only table (not on `students`) because
-- parents hold SELECT/UPDATE policies on their children's student rows and
-- must not see or edit rates. Attendance columns live on `bookings`, guarded
-- by a trigger since column grants can't separate admins from parents (both
-- use the `authenticated` role).

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- Per-student billing terms. One fixed weekly slot per student; the rate is
-- per lesson, so a month's expected income = rate × lessons that month.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_billing (
  student_id UUID PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  rate_cents INTEGER NOT NULL DEFAULT 0 CHECK (rate_cents >= 0),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  lesson_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes IN (30, 45, 60)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.student_billing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage student billing" ON public.student_billing;
CREATE POLICY "Admins manage student billing" ON public.student_billing
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE ALL ON public.student_billing FROM anon;

DROP TRIGGER IF EXISTS update_student_billing_updated_at ON public.student_billing;
CREATE TRIGGER update_student_billing_updated_at BEFORE UPDATE ON public.student_billing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- Attendance marks on individual lessons. NULL = not yet marked.
-- Note: 006's anon column grant on bookings (start_time, end_time, status)
-- already excludes these new columns.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS attendance TEXT CHECK (attendance IN ('on_time', 'missed')),
  ADD COLUMN IF NOT EXISTS attendance_marked_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.enforce_attendance_admin_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (NEW.attendance IS DISTINCT FROM OLD.attendance
      OR NEW.attendance_marked_at IS DISTINCT FROM OLD.attendance_marked_at)
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update attendance';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attendance_admin_only ON public.bookings;
CREATE TRIGGER trg_attendance_admin_only
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_attendance_admin_only();

commit;

-- ── Verification (run separately after applying) ─────────────────────────────
-- 1. As a parent (authenticated non-admin):
--      select * from student_billing;                  -- expect: 0 rows
--      update bookings set attendance = 'missed' where id = '<their booking>';
--                                                      -- expect: ERROR Only admins...
-- 2. As anon: select attendance from bookings;         -- expect: permission denied
