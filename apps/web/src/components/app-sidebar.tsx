import * as React from "react"
import { NavMain } from "@/web/components/nav-main"
import { NavUser } from "@/web/components/nav-user"
import navMainItems from "@/web/lib/router"
import { filterNavItems } from "@/web/lib/filter-nav-items"
import teamAppLogo from "/team-app-icon.png"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/web/components/ui/sidebar"
import useAuth from "../hooks/useAuth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {user} = useAuth()
  const userRole = (user as any)?.role

  const filteredItems = React.useMemo(
    () => filterNavItems(navMainItems, userRole),
    [userRole]
  )

  return (
    <Sidebar collapsible="icon" {...props} side="right" dir="rtl" >

      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <SidebarTrigger className=" w-10 mr-2 rotate-180" />
              <div className="flex items-center gap-4 text-right text-sm leading-tight">
                <img src={teamAppLogo} alt="TeamApp" width={40} />
                <span className="truncate font-medium">הצוות</span>
              </div>

            </SidebarMenuButton>

          </SidebarMenuItem>
        </SidebarMenu>

      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
