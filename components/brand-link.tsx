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
    <Link href="/" className={cn("inline-flex items-center rounded-md p-1", className)} onClick={onClick}>
      <span className="flex items-center justify-center rounded-md bg-wood-dark p-1.5">
        <Image
          src="/aba-music-academy-logo.png"
          alt="ABA Music Academy"
          width={512}
          height={512}
          priority={priority}
          className={cn("h-14 w-14 object-contain", imageClassName)}
        />
      </span>
    </Link>
  )
}
