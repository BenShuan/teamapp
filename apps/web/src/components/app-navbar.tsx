import { PropsWithChildren } from "react";
import { AppSidebar } from "./app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";

export default function AppNavbar({ children }: PropsWithChildren) {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>

        <div className="flex  flex-col lg:mr-60 gap-4 p-4 transition-[margin,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:mr-20">
          <SidebarTrigger  className=" top-4 right-3 ml-1 rotate-180 " />

          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}