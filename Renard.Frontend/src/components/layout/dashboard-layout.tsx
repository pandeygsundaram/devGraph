import React, { useState } from "react";
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: true,
    },
    { label: "Brain / Search", icon: Brain, href: "/dashboard/brain" },
    { label: "Activity Logs", icon: Activity, href: "/dashboard/activity" },
    { label: "Integrations", icon: Terminal, href: "/dashboard/integrations" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-screen flex flex-col fixed">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center text-primary-foreground font-bold mr-3">
              <img src={logo} />
            </div>
            <span className="font-bold text-lg text-foreground">Renard</span>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </a>
            ))}

            {/* Integration Status (Mini Widget in Sidebar) */}
            <div className="mt-8 px-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Active Sources
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-foreground">
                    <Code2 className="w-4 h-4 text-blue-500" /> VS Code
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-foreground">
                    <Terminal className="w-4 h-4 text-foreground" /> CLI Tool
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="w-4 h-4" /> Chrome
                  </div>
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>{" "}
                  {/* Disconnected example */}
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold border border-border">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  John Developer
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Free Plan
                </p>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
