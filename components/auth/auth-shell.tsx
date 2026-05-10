import { BrandLink } from "@/components/brand-link"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <BrandLink imageClassName="w-44" />
        </div>

        {children}
      </div>
    </div>
  )
}
