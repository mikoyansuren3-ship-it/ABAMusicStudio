import type * as React from "react"
import { Badge } from "@/components/ui/badge"

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"]

const statusVariants: Record<string, BadgeVariant> = {
  confirmed: "default",
  pending: "secondary",
  cancelled: "destructive",
  completed: "outline",
  active: "default",
  inactive: "secondary",
}

/** Shared booking/roster status badge with a capitalized label. */
export function BookingStatusBadge({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return <Badge variant={statusVariants[status] ?? "outline"}>{label}</Badge>
}
