-- 015_slot_teachers_and_rates.sql
-- Multi-teacher students: the teacher (and optionally duration/rate) moves to
-- the WEEKLY SLOT, with the student's own teacher/billing as the default.
-- A student can now take piano with one teacher and vocal with another —
-- different rate and length per subject — under a single profile.
--
-- Safe to run as-is in the Supabase SQL editor. Idempotent (re-runnable).
--
-- Notes:
-- * `student_slots.teacher_id/duration_minutes/rate_cents` are NULLABLE
--   overrides: NULL means "use students.teacher_id / student_billing".
--   Existing slots are backfilled with the student's current teacher so
--   nothing changes for single-teacher students.
-- * `bookings.rate_cents` is a per-lesson snapshot stamped at materialization
--   (like bookings.teacher_id from 014), so a later rate change never
--   rewrites what a past month earned. Guarded admin-only by a trigger with
--   the same shape as 014's teacher guard (column grants can't separate
--   admins from parents — both are `authenticated`).
-- * students.teacher_id stays: it is the student's DEFAULT teacher and keeps
--   roster membership working for students who have no slots yet.

begin;

ALTER TABLE public.student_slots
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER CHECK (duration_minutes > 0),
  ADD COLUMN IF NOT EXISTS rate_cents INTEGER CHECK (rate_cents >= 0);

CREATE INDEX IF NOT EXISTS idx_student_slots_teacher ON public.student_slots(teacher_id);

-- Backfill: existing slots inherit the student's current teacher explicitly,
-- so reassigning the student's default later never silently moves old slots.
UPDATE public.student_slots ss
SET teacher_id = s.teacher_id
FROM public.students s
WHERE s.id = ss.student_id
  AND ss.teacher_id IS NULL
  AND s.teacher_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- Per-lesson earned-rate snapshot.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS rate_cents INTEGER CHECK (rate_cents >= 0);

CREATE OR REPLACE FUNCTION public.enforce_booking_rate_admin_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.rate_cents IS DISTINCT FROM OLD.rate_cents
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can set lesson rates';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_booking_rate_admin_only() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_booking_rate_admin_only ON public.bookings;
CREATE TRIGGER trg_booking_rate_admin_only
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_rate_admin_only();

-- Backfill snapshots for existing lessons from the student's standing rate.
UPDATE public.bookings b
SET rate_cents = sb.rate_cents
FROM public.student_billing sb
WHERE sb.student_id = b.student_id
  AND b.rate_cents IS NULL;

commit;

-- ── Verification (run separately after applying) ─────────────────────────────
-- 1. As a parent (authenticated non-admin):
--      update bookings set rate_cents = 1 where id = '<their booking>';
--                                                   -- expect: ERROR Only admins...
-- 2. select count(*) from student_slots where teacher_id is null;
--                                                   -- 0 for students with a teacher
-- 3. select count(*) from bookings where rate_cents is null;
--                                                   -- 0 where billing exists
