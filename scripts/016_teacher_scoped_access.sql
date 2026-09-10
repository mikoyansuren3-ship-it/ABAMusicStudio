-- 016_teacher_scoped_access.sql
-- Scope the teacher dashboard to the signed-in teacher's own roster.
--
-- Safe to run as-is in the Supabase SQL editor. Idempotent (re-runnable).
--
-- Background: 002 gave every `profiles.role = 'teacher'` login blanket SELECT
-- on students and bookings ("Teachers can view all ..."), because 014 shipped
-- the roster with no teacher logins at all — `teachers.profile_id` was left
-- reserved. This activates that column: a teacher login is now identified by
-- the roster row that points at it, and sees only that row's students.
--
-- Notes:
-- * Membership matches the admin roster rule in app/admin/teachers/[teacherId]:
--   a student belongs to a teacher if ANY weekly slot is taught by them (the
--   slot's teacher_id falling back to the student's default), or — for a
--   student with no slots yet — if they are the student's default teacher.
-- * The lookups are SECURITY DEFINER so the policies can read student_slots,
--   which is admin-only under its own RLS (014). Same pattern as is_admin().
-- * EXECUTE stays granted to anon/authenticated: RLS evaluates these AS the
--   querying role, so revoking it would error every query on the table rather
--   than filter it. This is the documented is_admin() carve-out from 012.
-- * A teacher login with no roster row linked (or linked to an inactive one)
--   now sees NOTHING rather than everything. That is the point, but it means
--   a self-signed-up teacher stays empty until an admin links them.
-- * `bookings` also carries 002's "Anyone can view booked lesson times"
--   (status pending/confirmed) for public slot availability. Policies are
--   OR'ed, so that one still exposes booked TIMES studio-wide — this change
--   scopes what the teacher policy adds (cancelled/completed rows), and the
--   dashboard filters by teacher_id in the query regardless.
-- * inquiries stay studio-wide: a new-student inquiry has no teacher yet.

begin;

-- One login ↔ one roster row, so "the teacher for this profile" is
-- unambiguous (the lookups below LIMIT 1 on it).
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_profile_id_unique
  ON public.teachers(profile_id) WHERE profile_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- Who is the caller, on the roster?
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_teacher_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.id
  FROM public.teachers t
  WHERE t.profile_id = auth.uid()
    AND t.is_active
  LIMIT 1;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Does the caller teach this student? Slot teachers first (falling back to the
-- student's default), default alone when the student has no slots.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.teacher_teaches_student(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.current_teacher_id() IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM public.students s
       LEFT JOIN public.student_slots ss ON ss.student_id = s.id
       WHERE s.id = p_student_id
         AND COALESCE(ss.teacher_id, s.teacher_id) = public.current_teacher_id()
     );
$$;

REVOKE EXECUTE ON FUNCTION public.current_teacher_id() FROM public;
REVOKE EXECUTE ON FUNCTION public.teacher_teaches_student(UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.current_teacher_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_teaches_student(UUID) TO anon, authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- Replace the blanket teacher policies with scoped ones.
-- ────────────────────────────────────────────────────────────────────────────
-- The dashboard has to resolve "which roster row am I" before it can scope
-- anything, and 014 left `teachers` admin-only. Own row, SELECT only.
DROP POLICY IF EXISTS "Teachers view their own roster row" ON public.teachers;
CREATE POLICY "Teachers view their own roster row" ON public.teachers
  FOR SELECT USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
DROP POLICY IF EXISTS "Teachers view their own students" ON public.students;
CREATE POLICY "Teachers view their own students" ON public.students
  FOR SELECT USING (public.teacher_teaches_student(id));

DROP POLICY IF EXISTS "Teachers can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Teachers view their own lessons" ON public.bookings;
CREATE POLICY "Teachers view their own lessons" ON public.bookings
  FOR SELECT USING (
    teacher_id IS NOT NULL AND teacher_id = public.current_teacher_id()
  );

commit;

-- ── Verification (run separately after applying) ─────────────────────────────
-- 1. Linkage is unique and resolvable:
--      select t.name, p.full_name, p.role
--      from teachers t join profiles p on p.id = t.profile_id;
-- 2. Signed in as a teacher login (not the service role):
--      select count(*) from students;   -- only that teacher's roster
--      select count(*) from bookings where status = 'completed';
--                                       -- only lessons stamped to them
-- 3. Admin and parent access is untouched:
--      is_admin() policies and the parent_id policies from 002 are unchanged.
