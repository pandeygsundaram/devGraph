import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  ArrowUpRight,
  Code2,
  Terminal,
  Globe,
  Sparkles,
  GitCommit,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* 1. Welcome Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good Morning, John
          </h1>
          <p className="text-muted-foreground">
            Here is what Renard captured while you were working today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
            View Report
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Daily Summary
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Context Captured"
          value="12,405"
          label="tokens"
          trend="+12%"
          icon={<Brain className="w-5 h-5 text-purple-500" />}
        />
        <StatsCard
          title="Productivity Score"
          value="94"
          label="/ 100"
          trend="+5%"
          icon={<Activity className="w-5 h-5 text-primary" />}
        />
        <StatsCard
          title="Time Saved"
          value="2.5"
          label="hours"
          trend="auto-fill"
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Main Chart / Activity Area (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* CSS-Only Bar Chart */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">Activity Volume</h3>
              <select className="bg-secondary text-sm rounded-md px-2 py-1 border border-border text-foreground focus:outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            {/* Visual Chart Bars */}
            <div className="h-48 flex items-end justify-between gap-2">
              {[35, 45, 25, 60, 75, 50, 85].map((height, i) => (
                <div
                  key={i}
                  className="w-full flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-full bg-secondary hover:bg-primary/80 transition-all rounded-t-md relative group-hover:shadow-[0_0_15px_-3px_var(--color-primary)]"
                    style={{ height: `${height}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow border border-border transition-opacity">
                      {height * 10} Logs
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Context Logs */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-foreground">
                Recent Context Logs
              </h3>
              <button className="text-sm text-primary hover:underline">
                View All
              </button>
            </div>
            <div className="divide-y divide-border">
              <LogItem
                source="vscode"
                title="Modified auth-layout.tsx"
                time="2 mins ago"
                desc="Refactored the sidebar component to support mobile drawers."
              />
              <LogItem
                source="terminal"
                title="npm install framer-motion"
                time="15 mins ago"
                desc="Installed animation library for dashboard transitions."
              />
              <LogItem
                source="chrome"
                title="Researched: 'Tailwind v4 upgrade'"
                time="1 hour ago"
                desc="Read documentation on tailwindcss.com regarding new configuration."
              />
              <LogItem
                source="vscode"
                title="Git Commit: 'Fix dark mode toggle'"
                time="2 hours ago"
                desc="Fixed issue where sun icon was not visible in light mode."
              />
            </div>
          </div>
        </div>

        {/* 4. Side Panel / Suggestions (Right 1/3) */}
        <div className="space-y-6">
          {/* AI Insight */}
          <div className="bg-gradient-to-br from-primary/10 to-orange-500/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Renard Insight
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You've spent 40% of your time in{" "}
                  <strong>auth-related files</strong> today. Would you like me
                  to summarize the current authentication flow documentation?
                </p>
                <button className="mt-3 text-xs bg-primary text-white px-3 py-1.5 rounded-md font-medium shadow-sm hover:bg-primary/90">
                  Yes, summarize it
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium text-foreground transition-colors flex items-center justify-between group">
                <span>Search Knowledge Base</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium text-foreground transition-colors flex items-center justify-between group">
                <span>Configure Webhooks</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium text-foreground transition-colors flex items-center justify-between group">
                <span>Invite Team Member</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- Helper Components ---

function StatsCard({ title, value, label, trend, icon }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-secondary rounded-lg">{icon}</div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend === "auto-fill"
              ? "bg-white text-black dark:bg-blue-900/30 dark:text-blue-600"
              : "bg-white text-green-900  dark:text-green-800"
          }`}
        >
          {trend}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
    </div>
  );
}

function LogItem({ source, title, time, desc }: any) {
  const getIcon = () => {
    switch (source) {
      case "vscode":
        return <Code2 className="w-4 h-4 text-blue-500" />;
      case "terminal":
        return <Terminal className="w-4 h-4 text-foreground" />;
      case "chrome":
        return <Globe className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="px-6 py-4 flex gap-4 hover:bg-secondary/30 transition-colors group">
      <div className="mt-1 p-2 bg-secondary rounded-lg h-fit group-hover:bg-background border border-transparent group-hover:border-border transition-all">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-medium text-foreground truncate">
            {title}
          </h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {time}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
          {desc}
        </p>
      </div>
    </div>
  );
}

// Helper to avoid import errors in the example
import { Brain as BrainIcon, Activity as ActivityIcon } from "lucide-react";
const Brain = BrainIcon;
const Activity = ActivityIcon;
