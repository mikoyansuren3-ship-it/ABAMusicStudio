-- 017_teacher_attendance.sql
-- Let a teacher mark attendance on the lessons they teach, and take the
-- inquiries surface away from teacher logins.
--
-- Safe to run as-is in the Supabase SQL editor. Idempotent (re-runnable).
--
-- Notes:
-- * Attendance has been admin-only since 009/010, enforced by a BEFORE UPDATE
--   trigger (column grants can't separate admins from parents — both are
--   `authenticated`). Same mechanism here: the guard now also accepts the
--   lesson's teacher of record, resolved through 016's current_teacher_id().
-- * A teacher needs UPDATE on their own lesson rows for that to be reachable
--   at all (002 gave teachers SELECT only). The new policy is scoped to
--   `bookings.teacher_id`, and a second guard pins teachers to the attendance
--   columns — without it, row-level UPDATE would also let them move a lesson
--   or cancel it. Parents are exempted from that guard because they legitimately
--   update their own children's bookings (reschedules, 002).
-- * `made_up_on` stays writable by the teacher too: it is part of the same
--   decision ("missed, but we made it up") and 010 already guards it as one
--   unit with attendance.
-- * Inquiries: 002 let every teacher read and decide new-student inquiries.
--   Those belong to the admin portal — a new inquiry has no teacher yet — so
--   both teacher policies are dropped. Admin policies are untouched.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- Attendance: admins, or the teacher stamped on the lesson.
-- ────────────────────────────────────────────────────────────────────────────
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
     AND NOT public.is_admin()
     AND (OLD.teacher_id IS NULL OR OLD.teacher_id IS DISTINCT FROM public.current_teacher_id()) THEN
    RAISE EXCEPTION 'Only admins or the lesson''s teacher can update attendance';
  END IF;
  RETURN NEW;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- ...and nothing else. A teacher acting on their own lesson may change the
-- attendance columns only; times, status, student and money stay put.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_teacher_attendance_columns_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.is_admin()
     AND OLD.teacher_id IS NOT NULL
     AND OLD.teacher_id = public.current_teacher_id()
     AND NOT EXISTS (
       SELECT 1 FROM public.students s
       WHERE s.id = OLD.student_id AND s.parent_id = auth.uid()
     )
     AND (NEW.student_id, NEW.teacher_id, NEW.start_time, NEW.end_time, NEW.status)
         IS DISTINCT FROM
         (OLD.student_id, OLD.teacher_id, OLD.start_time, OLD.end_time, OLD.status) THEN
    RAISE EXCEPTION 'Teachers can only update lesson attendance';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_teacher_attendance_columns_only() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_teacher_attendance_columns_only ON public.bookings;
CREATE TRIGGER trg_teacher_attendance_columns_only
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_teacher_attendance_columns_only();

DROP POLICY IF EXISTS "Teachers mark attendance on their lessons" ON public.bookings;
CREATE POLICY "Teachers mark attendance on their lessons" ON public.bookings
  FOR UPDATE
  USING (teacher_id IS NOT NULL AND teacher_id = public.current_teacher_id())
  WITH CHECK (teacher_id IS NOT NULL AND teacher_id = public.current_teacher_id());

-- ────────────────────────────────────────────────────────────────────────────
-- Inquiries are an admin concern.
-- ────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Teachers can view inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Teachers can update inquiries" ON public.inquiries;

commit;

-- ── Verification (run separately after applying) ─────────────────────────────
-- Signed in as a teacher login (not the service role):
-- 1. update bookings set attendance = 'on_time', attendance_marked_at = now()
--      where id = '<one of their own lessons>';        -- expect: 1 row
-- 2. update bookings set attendance = 'on_time'
--      where id = '<another teacher's lesson>';        -- expect: 0 rows (RLS)
-- 3. update bookings set status = 'cancelled'
--      where id = '<one of their own lessons>';
--                        -- expect: ERROR Teachers can only update lesson attendance
-- 4. select count(*) from inquiries;                   -- expect: 0 rows
