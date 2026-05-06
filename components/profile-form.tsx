"use client"

import type React from "react"

import type { User } from "@supabase/supabase-js"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle } from "lucide-react"
import type { Profile, Student } from "@/lib/types"
import { updateProfile } from "@/app/portal/profile/actions"
import { useRouter } from "next/navigation"

interface ProfileFormProps {
  user: User
  profile: Profile | null
  student: Student | null
}

const timezones = [
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
]

export function ProfileForm({ user, profile, student }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile?.full_name || ""}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email || ""} disabled className="bg-muted" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone || ""}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select name="timezone" defaultValue={profile?.timezone || "America/New_York"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <h3 className="font-medium mb-4">Parent/Guardian Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parent_name">Parent/Guardian Name</Label>
                  <Input
                    id="parent_name"
                    name="parent_name"
                    defaultValue={student?.parent_name || ""}
                    placeholder="Parent name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_email">Parent/Guardian Email</Label>
                  <Input
                    id="parent_email"
                    name="parent_email"
                    type="email"
                    defaultValue={student?.parent_email || ""}
                    placeholder="parent@example.com"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="parent_phone">Parent/Guardian Phone</Label>
                <Input
                  id="parent_phone"
                  name="parent_phone"
                  type="tel"
                  defaultValue={student?.parent_phone || ""}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Profile updated successfully
              </div>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
