export type AuthRole = "student" | "teacher" | "admin"

export const roleDestinations: Record<AuthRole, string> = {
  student: "/portal",
  teacher: "/dashboard",
  admin: "/admin",
}

export const roleLabels: Record<AuthRole, string> = {
  student: "student",
  teacher: "teacher",
  admin: "administrator",
}
