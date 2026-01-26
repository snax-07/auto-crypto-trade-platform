"use client"

import {
  IconLogout,
  IconUserCircle,
  IconSettings,
  IconChevronsDown,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"

export function NavUser() {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8080/api/v1/auth/logout", { withCredentials: true })
      toast.success("Session terminated")
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error(error)
      toast.error("Logout failed: Network error")
    }
  }

  // Get initials for Avatar Fallback
  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "SQ"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale border border-border">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-lg bg-slate-100 text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-slate-900">{user?.name}</span>
                <span className="text-slate-500 truncate text-[10px] uppercase tracking-tighter">
                  {user?.email}
                </span>
              </div>
              <IconChevronsDown className="ml-auto size-4 text-slate-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-slate-200 shadow-xl"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs text-slate-500">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <IconUserCircle className="size-4 text-slate-500" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <IconSettings className="size-4 text-slate-500" />
                Prototype Config
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer font-medium"
            >
              <IconLogout className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}