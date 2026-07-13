"use client"

import { useRef, useState } from "react"
import { Camera, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { removeProfileAvatar, uploadProfileAvatar } from "@/app/portal/profile/actions"
import { ProfileAvatar } from "@/components/portal/profile-avatar"
import { PortalButton } from "@/components/portal/studio/portal-ui"
import type { Profile } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface ProfileAvatarUploadProps {
  user: User
  profile: Profile | null
}

export function ProfileAvatarUpload({ user, profile }: ProfileAvatarUploadProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const hasAvatar = Boolean(profile?.avatar_path)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setError(null)
    setSuccess(null)

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    setIsUploading(true)
    const formData = new FormData()
    formData.append("avatar", file)
    const result = await uploadProfileAvatar(formData)
    setIsUploading(false)

    URL.revokeObjectURL(objectUrl)
    setPreviewUrl(null)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess("Profile photo updated.")
    router.refresh()
  }

  async function handleRemove() {
    if (!hasAvatar) return
    setError(null)
    setSuccess(null)
    setIsRemoving(true)
    const result = await removeProfileAvatar()
    setIsRemoving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess("Profile photo removed.")
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading || isRemoving}
        className="group relative rounded-full focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:outline-none disabled:opacity-60"
        aria-label="Change profile photo"
      >
        {previewUrl ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-[#F5EFE3] shadow-[0_0_0_1.5px_rgba(201,169,110,0.15)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <ProfileAvatar
            fullName={profile?.full_name}
            email={user.email}
            avatarPath={profile?.avatar_path}
            updatedAt={profile?.updated_at}
            size="md"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileChange}
      />

      <div className="flex-1 text-center sm:text-left">
        <h2 className="font-serif text-[22px] font-bold text-[#2b1b14]">{profile?.full_name || "Student"}</h2>
        <p className="mt-1 text-sm text-[#8B7355]">{user.email}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <PortalButton
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading || isRemoving}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Change Photo"
            )}
          </PortalButton>
          {hasAvatar ? (
            <PortalButton type="button" variant="ghost" onClick={handleRemove} disabled={isUploading || isRemoving}>
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Remove
                </>
              )}
            </PortalButton>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-[#7d6b58]">JPEG, PNG, WebP, or GIF · max 2 MB</p>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        {success ? <p className="mt-2 text-sm text-[#4A7A4A]">{success}</p> : null}
      </div>
    </div>
  )
}
