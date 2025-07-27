import { Outlet } from "@remix-run/react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { AppCommand } from "../components/app-command";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar></AppSidebar>

      <SidebarInset>
        {/* Top Search Bar */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-center">
            <AppCommand />
          </div>
        </header>

        {/* Command Dialog */}

        {/* Page Content */}
        <div className="flex flex-1 flex-col gap-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
