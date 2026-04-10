import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Shield,
  Users,
  FileText,
  DollarSign,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navItems, title }) => {
  const { user, roles, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const primaryRole = roles[0]?.role || "unknown";

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BW</span>
            </div>
            <span className="font-bold text-lg text-foreground">Bridge Warranty</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{primaryRole.replace(/_/g, " ")}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-6 border-b border-border bg-card">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;

export const adminNavItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Dealerships", href: "/admin/dealerships", icon: Building2 },
  { label: "Providers", href: "/admin/providers", icon: Shield },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Contracts", href: "/admin/contracts", icon: FileText },
  { label: "Remittances", href: "/admin/remittances", icon: DollarSign },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const dealershipNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dealership", icon: LayoutDashboard },
  { label: "Find Products", href: "/dealership/find-products", icon: Package },
  { label: "Contracts", href: "/dealership/contracts", icon: FileText },
  { label: "Remittances", href: "/dealership/remittances", icon: DollarSign },
  { label: "Reporting", href: "/dealership/reporting", icon: Building2 },
  { label: "Configuration", href: "/dealership/settings/configuration", icon: Settings },
  { label: "Team", href: "/dealership/settings/team", icon: Users },
  { label: "Profile", href: "/dealership/settings/profile", icon: Shield },
];

export const providerNavItems: NavItem[] = [
  { label: "Overview", href: "/provider", icon: LayoutDashboard },
  { label: "Products", href: "/provider/products", icon: Package },
  { label: "Contracts", href: "/provider/contracts", icon: FileText },
  { label: "Remittances", href: "/provider/remittances", icon: DollarSign },
  { label: "Settings", href: "/provider/settings", icon: Settings },
];
