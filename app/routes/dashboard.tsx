import { Outlet, NavLink, useLocation } from "@remix-run/react";
import { 
  Home,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  BarChart3
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";

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
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
