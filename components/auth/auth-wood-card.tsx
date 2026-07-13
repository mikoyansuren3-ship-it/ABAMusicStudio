import { cn } from "@/lib/utils"

interface AuthWoodCardProps {
  children: React.ReactNode
  className?: string
}

export function AuthWoodCard({ children, className }: AuthWoodCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-wood-mid/8 bg-wood-card p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      {children}
    </div>
  )
}
