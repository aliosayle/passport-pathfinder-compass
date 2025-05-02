
import { ReactNode, useState } from "react";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Plane, Globe, Home, User, Calendar, Ticket, Flag } from "lucide-react";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const activePage = currentPath === "/" 
    ? "home" 
    : currentPath.substring(1); // Remove the leading slash

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
                <SidebarMenuButton asChild isActive={activePage === "home"}>
                  <a href="/">
                    <Home />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activePage === "flights"}>
                  <a href="/flights">
                    <Plane />
                    <span>Flights</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activePage === "tickets"}>
                  <a href="/tickets">
                    <Ticket />
                    <span>Tickets</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activePage === "passports"}>
                  <a href="/passports">
                    <Calendar />
                    <span>Passports</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activePage === "nationalities"}>
                  <a href="/nationalities">
                    <Globe />
                    <span>Nationalities</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activePage === "airlines"}>
                  <a href="/airlines">
                    <Plane />
                    <span>Airlines</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activePage === "visas"}>
                  <a href="/visas">
                    <User />
                    <span>Visas</span>
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
