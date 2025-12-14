import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Brain,
  Activity,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
  Terminal,
  Code2,
  Globe,
} from "lucide-react";
import { ModeToggle } from "@/components/common/mode-toggle";
import logo from "@/assets/logo-Photoroom.png";
import { useNavigate, Link } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const currentPath = window.location.pathname;

  const navItems = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: currentPath === "/dashboard",
    },
    {
      label: "Brain / Search",
      icon: Brain,
      href: "/dashboard/brain",
      active: currentPath === "/dashboard/brain",
    },
    {
      label: "Integrations",
      icon: Terminal,
      href: "/dashboard/integrations",
      active: currentPath === "/dashboard/integrations",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: currentPath === "/dashboard/settings",
    },
  ];

  return (
    // 1. Root Container: h-screen and overflow-hidden ensures the body doesn't scroll
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border 
          transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* 2. Inner Sidebar: h-full makes it fill the aside, 'flex-col' for layout */}
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex-none flex items-center px-6 border-b border-border">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground font-bold mr-3 overflow-hidden">
              <img
                src={logo}
                alt="Renard Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-lg text-foreground">Renard</span>
          </div>

          {/* Nav Links - flex-1 and overflow-y-auto allows ONLY the links to scroll if the screen is short */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}

            {/* Quick Info */}
            <div className="mt-8 px-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Available Tools
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Terminal className="w-4 h-4" />
                  <span>CLI Tool</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span>Browser Extension</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Footer - flex-none ensures it stays pinned to bottom */}
          <div className="p-4 border-t border-border flex-none">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold border border-border">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || ""}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 3. Main Content Wrapper: flex-1 takes remaining width, h-full fills height */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Stays Fixed at Top */}
        <header className="h-16 flex-none border-b border-border bg-background/80 backdrop-blur-sm z-30 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Semantic Search Bar */}
            <div className="relative hidden md:block w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ask Renard: 'What did I work on yesterday?'"
                className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </button>
            <ModeToggle />
          </div>
        </header>

        {/* 4. Scrollable Page Content: This is the ONLY part that scrolls */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
