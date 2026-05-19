"use client"

import type React from "react"
import type { User } from "@supabase/supabase-js"
import { useState } from "react"
import { Loader2, CheckCircle } from "lucide-react"
import type { Profile, Student } from "@/lib/types"
import { updateProfile } from "@/app/portal/profile/actions"
import { useRouter } from "next/navigation"
import { ProfileAvatarUpload } from "@/components/portal/profile-avatar-upload"
import { durationLabel, experienceLabel } from "@/lib/portal/format"
import {
  PortalButton,
  PortalCard,
  PortalPageBody,
  PortalPageHeader,
  SectionDivider,
} from "@/components/portal/studio/portal-ui"
import { cn } from "@/lib/utils"

interface ProfileFormProps {
  user: User
  profile: Profile | null
  student: Student | null
}

function StudioField({
  label,
  children,
  span,
}: {
  label: string
  children: React.ReactNode
  span?: 2
}) {
  return (
    <div className={cn(span === 2 && "sm:col-span-2")}>
      <label className="mb-1.5 block text-xs font-semibold tracking-wide text-[#8B7355]">{label}</label>
      {children}
    </div>
  )
}

const fieldClass =
  "w-full rounded-lg border-[1.5px] border-[rgba(78,52,37,0.08)] bg-white px-3.5 py-2.5 text-sm text-[#2b1b14] outline-none transition-colors focus:border-[#C9A96E] disabled:bg-[rgba(78,52,37,0.03)] disabled:text-[#B8A89A]"

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
    <div className="flex min-h-full flex-col">
      <PortalPageHeader title="Profile" subtitle="Manage your personal information" />

      <PortalPageBody className="max-w-2xl">
        <PortalCard className="mb-6 p-7">
          <ProfileAvatarUpload user={user} profile={profile} />
          <div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-[rgba(78,52,37,0.06)] pt-4 sm:justify-start">
            <span className="rounded-full bg-[rgba(201,169,110,0.1)] px-3 py-0.5 text-[11px] font-semibold text-[#C9A96E]">
              {experienceLabel(student?.experience_level)}
            </span>
            <span className="rounded-full bg-[rgba(59,37,24,0.06)] px-3 py-0.5 text-[11px] font-semibold text-[#8B7355]">
              Piano · {durationLabel(student?.preferred_lesson_duration)}
            </span>
          </div>
        </PortalCard>

        <form onSubmit={handleSubmit}>
          <SectionDivider label="Personal Information" />
          <PortalCard className="mb-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <StudioField label="Full Name">
                <input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile?.full_name || ""}
                  placeholder="Your name"
                  className={fieldClass}
                />
              </StudioField>
              <StudioField label="Email">
                <input id="email" type="email" value={user.email || ""} disabled className={fieldClass} />
              </StudioField>
              <StudioField label="Phone" span={2}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone || ""}
                  placeholder="818-836-2322"
                  className={fieldClass}
                />
              </StudioField>
            </div>
          </PortalCard>

          <SectionDivider clef="bass" label="Student Information" />
          <PortalCard className="mb-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <StudioField label="Student Name">
                <input
                  id="student_name"
                  name="student_name"
                  defaultValue={student?.name || ""}
                  placeholder="Student name"
                  className={fieldClass}
                />
              </StudioField>
              <StudioField label="Experience Level">
                <select
                  name="experience_level"
                  defaultValue={student?.experience_level || "beginner"}
                  className={cn(fieldClass, "appearance-none")}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </StudioField>
              <StudioField label="Preferred Lesson Length" span={2}>
                <select
                  name="preferred_lesson_duration"
                  defaultValue={(student?.preferred_lesson_duration || 30).toString()}
                  className={cn(fieldClass, "appearance-none")}
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </StudioField>
            </div>
          </PortalCard>

          {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-wrap items-center gap-3 pb-10">
            <PortalButton variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </PortalButton>
            {success ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-[#4A7A4A]">
                <CheckCircle className="h-4 w-4" />
                Profile updated
              </span>
            ) : null}
          </div>
        </form>
      </PortalPageBody>
    </div>
  )
}
