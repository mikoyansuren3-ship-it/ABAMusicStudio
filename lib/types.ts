export interface Profile {
  id: string
  role: "admin" | "student"
  full_name: string | null
  phone: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  profile_id: string
  parent_name: string | null
  parent_email: string | null
  parent_phone: string | null
  experience_level: "beginner" | "intermediate" | "advanced" | null
  preferred_lesson_duration: 30 | 45 | 60
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  profile?: Profile
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
  start_time: string
  end_time: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  is_recurring: boolean
  recurring_day_of_week: number | null
  notes: string | null
  created_at: string
  updated_at: string
  student?: Student
}

export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
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
