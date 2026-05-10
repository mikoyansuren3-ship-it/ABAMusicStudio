import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface BrandLinkProps {
  className?: string
  imageClassName?: string
  priority?: boolean
  onClick?: () => void
}

export function BrandLink({ className, imageClassName, priority = false, onClick }: BrandLinkProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} onClick={onClick}>
      <Image
        src="/aba-music-academy-logo.png"
        alt="ABA Music Academy"
        width={280}
        height={140}
        priority={priority}
        className={cn("h-auto w-40", imageClassName)}
      />
    </Link>
  )
}
