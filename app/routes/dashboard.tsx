import { Outlet, NavLink, useLocation, useNavigate } from "@remix-run/react";
import { 
  Home,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  BarChart3,
  Search,
  Command
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { Input } from "~/components/ui/input";
import { useEffect, useRef, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";

const sidebarItems = [
  { id: "home", label: "Home", icon: Home, href: "/dashboard" },
  { id: "my-drive", label: "My Drive", icon: HardDrive, href: "/dashboard/folders/root" },
  { id: "shared", label: "Shared with me", icon: Users, href: "/dashboard/shared" },
  { id: "recents", label: "Recents", icon: Clock, href: "/dashboard/recents" },
  { id: "favourites", label: "Favourites", icon: Star, href: "/dashboard/favourites" },
  { id: "trash", label: "Trash", icon: Trash2, href: "/dashboard/trash" },
  { id: "usage", label: "Usage", icon: BarChart3, href: "/dashboard/usage" },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  // Detect if user is on Mac
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Add keyboard shortcut for Cmd+K (search)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    
    if (query.trim()) {
      navigate(`/dashboard/search?query=${encodeURIComponent(query.trim())}`);
    }
  };
  
  const isActiveItem = (item: typeof sidebarItems[0]) => {
    // Special case for My Drive - should be active for all folder routes
    if (item.id === "my-drive") {
      return location.pathname.startsWith("/dashboard/folders");
    }
    // For other items, exact match
    return location.pathname === item.href;
  };

  return (
    <SidebarProvider>
      <AppSidebar></AppSidebar>

      <SidebarInset>
        {/* Top Search Bar */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-center">
            <form onSubmit={handleSearch} className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                name="query"
                placeholder="Search in Stratus"
                className="w-full pl-9 pr-12"
                autoComplete="off"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {isMac ? (
                  <>
                    <Command className="h-3 w-3" />
                    <span className="text-xs">K</span>
                  </>
                ) : (
                  'Ctrl+K'
                )}
              </kbd>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
