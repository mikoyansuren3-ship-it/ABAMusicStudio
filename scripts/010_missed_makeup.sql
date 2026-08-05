-- 010_missed_makeup.sql
-- Missed-lesson income policy: a missed lesson earns nothing unless it was
-- made up. `made_up_on` records the day the make-up class happened; setting it
-- restores that lesson's income.
--
-- Safe to run as-is in the Supabase SQL editor. Idempotent (re-runnable).

begin;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS made_up_on DATE;

-- Extend the 009 attendance guard to cover the make-up date as well.
CREATE OR REPLACE FUNCTION public.enforce_attendance_admin_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (NEW.attendance IS DISTINCT FROM OLD.attendance
      OR NEW.attendance_marked_at IS DISTINCT FROM OLD.attendance_marked_at
      OR NEW.made_up_on IS DISTINCT FROM OLD.made_up_on)
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update attendance';
  END IF;
  RETURN NEW;
END;
$$;

commit;

-- ── Verification (run separately after applying) ─────────────────────────────
-- As a parent (authenticated non-admin):
--   update bookings set made_up_on = current_date where id = '<their booking>';
--                                                   -- expect: ERROR Only admins...
