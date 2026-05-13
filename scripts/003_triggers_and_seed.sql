-- Triggers and Seed Data

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'student',
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_availability_updated_at BEFORE UPDATE ON teacher_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed studio settings
INSERT INTO studio_settings (key, value) VALUES
  ('pricing', '{"30min": 4500, "45min": 6000, "60min": 7500, "trial": 2500}'::jsonb),
  ('buffer_time', '{"minutes": 10}'::jsonb),
  ('policies', '{"cancellation": "24 hours notice required for cancellations. Late cancellations may be charged.", "late": "Students arriving more than 15 minutes late may have their lesson shortened.", "payment": "Monthly payment must be paid by the end of the first week. Each additional week after the first week is charged an extra 10%."}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Seed default availability (Mon-Fri 3pm-7pm, Sat 10am-2pm)
INSERT INTO availability (day_of_week, start_time, end_time) VALUES
  (1, '15:00', '19:00'),  -- Monday
  (2, '15:00', '19:00'),  -- Tuesday
  (3, '15:00', '19:00'),  -- Wednesday
  (4, '15:00', '19:00'),  -- Thursday
  (5, '15:00', '19:00'),  -- Friday
  (6, '10:00', '14:00')   -- Saturday
ON CONFLICT DO NOTHING;
