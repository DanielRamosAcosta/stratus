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
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-muted/10 border-r border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="Stratus" className="h-8 w-8" />
              <h1 className="text-xl font-semibold text-foreground">Stratus</h1>
            </div>
            <ThemeToggle />
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveItem(item);
              const isDisabled = item.id !== "my-drive";
              
              return (
                <NavLink
                  key={item.id}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isDisabled
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    }
                  }}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Search Bar */}
        <header className="border-b border-border px-6 py-4 bg-background">
          <div className="flex items-center justify-center">
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
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
