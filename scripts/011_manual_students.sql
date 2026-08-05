-- 011_manual_students.sql
-- Manual student entry: the admin can add students directly, without a linked
-- parent account, and with as much or as little information as they have.
--
-- Safe to run as-is in the Supabase SQL editor. Idempotent (re-runnable).
--
-- Safety notes:
-- - Parent RLS policies compare parent_id = auth.uid(), which is never true
--   for NULL parent_id, so manually added students are admin-only.
-- - student_billing keeps NOT NULL rate_cents; only the weekly slot becomes
--   optional (a student can have a rate before their day/time is settled).

begin;

ALTER TABLE public.students ALTER COLUMN parent_id DROP NOT NULL;

-- Contact info for manually added students (they have no profile row).
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

ALTER TABLE public.student_billing ALTER COLUMN day_of_week DROP NOT NULL;
ALTER TABLE public.student_billing ALTER COLUMN lesson_time DROP NOT NULL;

commit;
