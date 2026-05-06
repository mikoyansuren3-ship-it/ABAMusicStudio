-- RLS Policies for ABA Music Studio

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "New users can insert their profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Students policies
CREATE POLICY "Parents can view their children" ON students
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can update their children" ON students
  FOR UPDATE USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert their own student record" ON students
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Admins can view all students" ON students
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert students" ON students
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update all students" ON students
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete students" ON students
  FOR DELETE USING (is_admin());

-- Availability policies (public read, admin write)
CREATE POLICY "Anyone can view availability" ON availability
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert availability" ON availability
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update availability" ON availability
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete availability" ON availability
  FOR DELETE USING (is_admin());

-- Availability exceptions policies
CREATE POLICY "Anyone can view availability exceptions" ON availability_exceptions
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert exceptions" ON availability_exceptions
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update exceptions" ON availability_exceptions
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete exceptions" ON availability_exceptions
  FOR DELETE USING (is_admin());

-- Bookings policies
CREATE POLICY "Anyone can view booked lesson times" ON bookings
  FOR SELECT USING (status IN ('pending', 'confirmed'));

CREATE POLICY "Parents can view their children bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = bookings.student_id 
      AND students.parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert bookings" ON bookings
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update bookings" ON bookings
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete bookings" ON bookings
  FOR DELETE USING (is_admin());

CREATE POLICY "Parents can update their children bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = bookings.student_id 
      AND students.parent_id = auth.uid()
    )
  );

-- Inquiries policies (public insert, admin manage)
CREATE POLICY "Anyone can insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries" ON inquiries
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update inquiries" ON inquiries
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete inquiries" ON inquiries
  FOR DELETE USING (is_admin());

-- Invoices policies
CREATE POLICY "Parents can view their children invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = invoices.student_id 
      AND students.parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert invoices" ON invoices
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update invoices" ON invoices
  FOR UPDATE USING (is_admin());

CREATE POLICY "Parents can update their children invoices for payment" ON invoices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = invoices.student_id 
      AND students.parent_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (
    audience = 'all' 
    OR auth.uid() = ANY(recipient_ids)
    OR is_admin()
  );

CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update notifications" ON notifications
  FOR UPDATE USING (is_admin());

CREATE POLICY "Users can mark notifications as read" ON notifications
  FOR UPDATE USING (true);

-- Studio settings policies
CREATE POLICY "Anyone can view studio settings" ON studio_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert studio settings" ON studio_settings
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update studio settings" ON studio_settings
  FOR UPDATE USING (is_admin());
