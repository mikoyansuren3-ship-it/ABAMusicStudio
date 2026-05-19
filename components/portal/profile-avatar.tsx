"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { getAvatarPublicUrl } from "@/lib/portal/avatar"

const sizeClasses = {
  sm: "h-[34px] w-[34px] text-xs",
  md: "h-20 w-20 text-2xl",
  lg: "h-24 w-24 text-2xl",
} as const

interface ProfileAvatarProps {
  fullName?: string | null
  email?: string | null
  avatarPath?: string | null
  updatedAt?: string | null
  size?: keyof typeof sizeClasses
  className?: string
}

export function getProfileInitials(fullName?: string | null, email?: string | null) {
  if (fullName) {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return email?.charAt(0).toUpperCase() || "U"
}

export function ProfileAvatar({
  fullName,
  email,
  avatarPath,
  updatedAt,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const initials = getProfileInitials(fullName, email)
  const avatarUrl = getAvatarPublicUrl(avatarPath, updatedAt)

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border-[3px] border-[#F5EFE3] bg-gradient-to-br from-[#C9A96E] to-[#8B5E3C] font-bold text-white shadow-[0_0_0_1.5px_rgba(201,169,110,0.15)]",
        sizeClasses[size],
        className,
      )}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" fill className="object-cover" sizes={size === "sm" ? "34px" : "96px"} />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initials}</span>
      )}
    </div>
  )
}
