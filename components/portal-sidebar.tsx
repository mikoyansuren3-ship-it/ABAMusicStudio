"use client"

import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BrandLink } from "@/components/brand-link"
import { createClient } from "@/lib/supabase/client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LayoutDashboard, Calendar, CreditCard, Bell, UserIcon, ChevronUp, LogOut } from "lucide-react"
import type { Profile } from "@/lib/types"

interface PortalSidebarProps {
  user: User
  profile: Profile | null
}

const menuItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/schedule", label: "Schedule", icon: Calendar },
  { href: "/portal/payments", label: "Payments", icon: CreditCard },
  { href: "/portal/notifications", label: "Notifications", icon: Bell },
  { href: "/portal/profile", label: "Profile", icon: UserIcon },
]

export function PortalSidebar({ user, profile }: PortalSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U"

  return (
    <Sidebar>
      <SidebarHeader>
        <BrandLink className="px-2 py-4" imageClassName="w-40" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Student Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-accent text-accent-foreground text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start text-left text-sm">
                    <span className="font-medium">{profile?.full_name || "Student"}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</span>
                  </div>
                  <ChevronUp className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/portal/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
