-- 014_teachers_and_slots.sql
-- Teachers (admin-managed roster, pay, calendars — no teacher logins this
-- phase) + multi-slot weekly scheduling (a student can take up to one lesson
-- per weekday instead of one per week).
--
-- Safe to run as-is in the Supabase SQL editor. Idempotent (re-runnable).
--
-- Notes:
-- * `public.teachers` is a NEW admin-only entity. It is deliberately NOT the
--   same thing as `profiles.role = 'teacher'` (auth identity) or the orphaned
--   `teacher_availability` table (abandoned pre-redesign /dashboard) — both
--   are left untouched. `teachers.profile_id` is reserved for a future
--   teacher-login phase.
-- * `student_slots` replaces `student_billing.day_of_week/lesson_time`. The
--   single legacy slot is copied over (inheriting billing.created_at so the
--   lesson-generation horizon is unchanged), then the old columns are DROPPED
--   — the app code switches to slots in the same change.
-- * `bookings.teacher_id` is a snapshot stamped when a lesson is created, so
--   reassigning a student never rewrites past months' pay reports. bookings
--   is a mixed-role table (parents update reschedules), so the column is
--   guarded by a trigger like attendance (009/010), with function hygiene
--   per 012/013.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- Teachers. pay_hourly_cents: pay per lesson = hourly × duration / 60
-- (owner teaches too — her row simply carries 0).
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  instrument TEXT,
  pay_hourly_cents INTEGER NOT NULL DEFAULT 3000 CHECK (pay_hourly_cents >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage teachers" ON public.teachers;
CREATE POLICY "Admins manage teachers" ON public.teachers
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE ALL ON public.teachers FROM anon;

DROP TRIGGER IF EXISTS update_teachers_updated_at ON public.teachers;
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- Weekly lesson slots, many per student. UNIQUE(student_id, day_of_week):
-- the lesson materializer dedupes by student + local date, so a second slot
-- on the same weekday could never generate a lesson — the constraint makes
-- that dead state unrepresentable.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  lesson_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, day_of_week)
);

ALTER TABLE public.student_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage student slots" ON public.student_slots;
CREATE POLICY "Admins manage student slots" ON public.student_slots
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE ALL ON public.student_slots FROM anon;

CREATE INDEX IF NOT EXISTS idx_student_slots_student ON public.student_slots(student_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Teacher assignment + guardian email on students. profiles has no email
-- column (email lives in auth.users), so the roster's "parent email" is
-- admin-entered, like contact_name/contact_phone from 011.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

CREATE INDEX IF NOT EXISTS idx_students_teacher ON public.students(teacher_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Snapshot teacher attribution on lessons. Admin-only via guard trigger
-- (column grants can't separate admins from parents — both `authenticated`).
-- `auth.uid() IS NOT NULL` intentionally lets server-side/service-role
-- writes through, same as the attendance guard.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.enforce_booking_teacher_admin_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.teacher_id IS DISTINCT FROM OLD.teacher_id
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can assign lesson teachers';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_booking_teacher_admin_only() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_booking_teacher_admin_only ON public.bookings;
CREATE TRIGGER trg_booking_teacher_admin_only
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_teacher_admin_only();

-- ────────────────────────────────────────────────────────────────────────────
-- Copy the single legacy slot into student_slots, then drop the old columns.
-- Wrapped in a column-existence check so re-runs (after the drop) are no-ops.
-- ────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'student_billing'
      AND column_name = 'day_of_week'
  ) THEN
    INSERT INTO public.student_slots (student_id, day_of_week, lesson_time, created_at)
    SELECT sb.student_id, sb.day_of_week, sb.lesson_time, sb.created_at
    FROM public.student_billing sb
    WHERE sb.day_of_week IS NOT NULL AND sb.lesson_time IS NOT NULL
    ON CONFLICT (student_id, day_of_week) DO NOTHING;

    ALTER TABLE public.student_billing DROP COLUMN day_of_week;
    ALTER TABLE public.student_billing DROP COLUMN lesson_time;
  END IF;
END;
$$;

commit;

-- ── Verification (run separately after applying) ─────────────────────────────
-- 1. As anon:
--      select * from teachers;                          -- expect: permission denied
--      select * from student_slots;                     -- expect: permission denied
-- 2. As a parent (authenticated non-admin):
--      select * from teachers;                          -- expect: 0 rows
--      select * from student_slots;                     -- expect: 0 rows
--      update bookings set teacher_id = uuid_generate_v4() where id = '<their booking>';
--                                                       -- expect: ERROR Only admins...
-- 3. Slot copy sanity (run as admin/SQL editor):
--      select count(*) from student_slots;              -- >= number of students that
--                                                       --   had a day+time before 014
-- 4. select column_name from information_schema.columns
--      where table_name = 'student_billing';            -- no day_of_week / lesson_time
