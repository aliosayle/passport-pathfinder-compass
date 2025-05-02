
import { ReactNode, useState } from "react";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Calendar, Flag, Home, User } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [active, setActive] = useState("home");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="w-64">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground">
                <Flag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-sidebar-foreground">Passport Manager</h2>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={active === "home"} onClick={() => setActive("home")}>
                  <a href="/">
                    <Home />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={active === "employees"} onClick={() => setActive("employees")}>
                  <a href="/employees">
                    <User />
                    <span>Employees</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={active === "passports"} onClick={() => setActive("passports")}>
                  <a href="/passports">
                    <Calendar />
                    <span>Passports</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-4 py-3 text-xs text-sidebar-foreground/70">
              Passport Pathfinder Compass v1.0
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="flex items-center p-4 border-b">
            <SidebarTrigger />
            <h1 className="ml-4 text-xl font-bold">Company Passport Manager</h1>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
