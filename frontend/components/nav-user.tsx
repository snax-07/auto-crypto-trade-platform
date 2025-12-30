"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
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
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"

export function NavUser() {

  const {user} = useAuth();
  const router = useRouter()
  const { isMobile } = useSidebar()

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/auth/logout" , {withCredentials : true})
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error("ERR_NET : Network Error")
    }
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={"user.avatar"} alt={user?.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
              <button onClick={handleLogout} ><IconLogout /></button>
            </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
