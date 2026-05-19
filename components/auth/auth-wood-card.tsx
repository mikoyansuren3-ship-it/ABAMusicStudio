import { cn } from "@/lib/utils"

interface AuthWoodCardProps {
  children: React.ReactNode
  className?: string
}

export function AuthWoodCard({ children, className }: AuthWoodCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-[20px] border border-[rgba(78,52,37,0.08)] bg-[#f5efe6] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.5)]",
        className,
      )}
    >
      {children}
    </div>
  )
}
