import { Outlet } from "@remix-run/react";
import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { PlatformShortcut, useShortcut } from "../providers/ShortcutProvider";
import { AppCommand } from "../components/app-command";
import { Shortcut } from "../components/shortcut";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  const shortcut: PlatformShortcut = {
    mac: { meta: true, key: "k" },
    other: { ctrl: true, key: "k" },
  };

  useShortcut(shortcut, () => {
    setOpen(true);
  });

  return (
    <SidebarProvider>
      <AppSidebar></AppSidebar>

      <SidebarInset>
        {/* Top Search Bar */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-center">
            <Button
              variant="outline"
              className="relative max-w-md w-full justify-start text-sm text-muted-foreground shadow-none"
              onClick={() => setOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search in Stratus...</span>
              <div className="flex-1" />
              <Shortcut shortcut={shortcut} />
            </Button>
          </div>
        </header>

        {/* Command Dialog */}
        <AppCommand open={open} setOpen={setOpen} />

        {/* Page Content */}
        <div className="flex flex-1 flex-col gap-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
