export interface Profile {
  id: string
  role: "admin" | "student" | "teacher"
  full_name: string | null
  phone: string | null
  avatar_path: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface TeacherAvailability {
  id: string
  teacher_id: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  parent_id: string | null
  teacher_id: string | null
  name: string
  experience_level: "beginner" | "intermediate" | "advanced" | null
  preferred_lesson_duration: 30 | 45 | 60
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  profile?: Profile | null
  profiles?: Profile | null
}

export interface Teacher {
  id: string
  name: string
  instrument: string | null
  /** Pay per lesson = pay_hourly_cents × duration / 60. The owner's row is 0. */
  pay_hourly_cents: number
  is_active: boolean
  sort_order: number
  /** Reserved for a future teacher-login phase. */
  profile_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface StudentSlot {
  id: string
  student_id: string
  day_of_week: number
  lesson_time: string
  /** Overrides for this slot; NULL falls back to the student's teacher / billing. */
  teacher_id: string | null
  duration_minutes: number | null
  rate_cents: number | null
  created_at: string
}

export interface Availability {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AvailabilityException {
  id: string
  exception_date: string
  is_available: boolean
  start_time: string | null
  end_time: string | null
  reason: string | null
  created_at: string
}

export interface Booking {
  id: string
  student_id: string
  /** Snapshot of the slot's (or student's) teacher when the lesson was created; NULL = unassigned. */
  teacher_id: string | null
  /** Snapshot of the rate this lesson earns; NULL on legacy rows = use the student's standing rate. */
  rate_cents: number | null
  start_time: string
  end_time: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  is_recurring: boolean
  recurring_day_of_week: number | null
  attendance: "on_time" | "missed" | null
  attendance_marked_at: string | null
  made_up_on: string | null
  notes: string | null
  created_at: string
  updated_at: string
  student?: Student
}

export interface StudentBilling {
  student_id: string
  rate_cents: number
  duration_minutes: 30 | 45 | 60
  created_at: string
  updated_at: string
}

export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  instrument: string | null
  student_age: number | null
  experience_level: "beginner" | "intermediate" | "advanced" | null
  preferred_lesson_duration: 30 | 45 | 60
  preferred_days: string[] | null
  preferred_times: string | null
  requested_slot_start: string | null
  requested_slot_end: string | null
  message: string | null
  status: "pending" | "approved" | "denied" | "waitlist"
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  student_id: string
  amount: number
  description: string | null
  status: "unpaid" | "paid" | "cancelled"
  due_date: string | null
  paid_at: string | null
  payment_method: "stripe" | "cash" | "check" | null
  stripe_payment_intent_id: string | null
  /** Set when the invoice email was last sent to the family. */
  sent_at: string | null
  sent_to: string | null
  created_at: string
  updated_at: string
  student?: Student
}

export interface Notification {
  id: string
  title: string
  body: string
  audience: "all" | "selected"
  recipient_ids: string[] | null
  is_read_by: string[]
  created_at: string
}

export interface StudioSettings {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface Pricing {
  "30min": number
  "45min": number
  "60min": number
  trial: number
}
