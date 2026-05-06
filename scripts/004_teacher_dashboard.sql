-- Teacher dashboard support

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'student', 'teacher'));

CREATE TABLE IF NOT EXISTS teacher_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (teacher_id, day_of_week, start_time, end_time)
);

ALTER TABLE teacher_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can view own availability" ON teacher_availability;
CREATE POLICY "Teachers can view own availability" ON teacher_availability
  FOR SELECT USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can insert own availability" ON teacher_availability;
CREATE POLICY "Teachers can insert own availability" ON teacher_availability
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can update own availability" ON teacher_availability;
CREATE POLICY "Teachers can update own availability" ON teacher_availability
  FOR UPDATE USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can delete own availability" ON teacher_availability;
CREATE POLICY "Teachers can delete own availability" ON teacher_availability
  FOR DELETE USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view all students" ON students;
CREATE POLICY "Teachers can view all students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Teachers can view all bookings" ON bookings;
CREATE POLICY "Teachers can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Teachers can view inquiries" ON inquiries;
CREATE POLICY "Teachers can view inquiries" ON inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Teachers can update inquiries" ON inquiries;
CREATE POLICY "Teachers can update inquiries" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

DROP TRIGGER IF EXISTS update_teacher_availability_updated_at ON teacher_availability;
CREATE TRIGGER update_teacher_availability_updated_at BEFORE UPDATE ON teacher_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
