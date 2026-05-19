export const AVATAR_BUCKET = "avatars"
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const

export function avatarObjectPath(userId: string, extension: string) {
  return `${userId}/avatar.${extension}`
}

export function getAvatarPublicUrl(avatarPath: string | null | undefined, updatedAt?: string | null) {
  if (!avatarPath) return null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  const base = `${supabaseUrl}/storage/v1/object/public/${AVATAR_BUCKET}/${avatarPath}`
  if (!updatedAt) return base

  return `${base}?v=${encodeURIComponent(updatedAt)}`
}

export function extensionForMimeType(mime: string) {
  switch (mime) {
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return "jpg"
  }
}

export function validateAvatarFile(file: File) {
  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return "Please upload a JPEG, PNG, WebP, or GIF image."
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return "Image must be 2 MB or smaller."
  }
  return null
}
