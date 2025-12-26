import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  ArrowUpRight,
  Code2,
  Terminal,
  Globe,
  Sparkles,
  Clock,
  Brain,
  Activity,
  Lock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ActivityHeatmap } from "@/components/common/ActivityHeatmap";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalHours: 0,
    productivityScore: 0,
  });
  const [loading, setLoading] = useState(true);

  // --- Password Set State ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const API_URL = import.meta.env.VITE_SERVER;

  useEffect(() => {
    fetchUserData();
    fetchActivities();
  }, []);

  const fetchUserData = async () => {
    try {
      // Load directly from local storage (no API call needed)
      const userData = localStorage.getItem("user");
      const teamData = localStorage.getItem("team");
      const apiKeyData = localStorage.getItem("apiKey");

      if (userData) {
        setUser(JSON.parse(userData));
      }
      if (teamData) {
        setTeam(JSON.parse(teamData));
      }
      if (apiKeyData) {
        setApiKey(apiKeyData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/activities?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setActivities(response.data.activities || []);

      const total = response.data.count || 0;
      setStats({
        totalActivities: total,
        totalHours: total * 0.5,
        productivityScore: Math.min(100, total * 2),
      });
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("token");

      // 1. API Call
      await axios.post(
        `${API_URL}/auth/set-password`,
        { newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPasswordMsg({
        type: "success",
        text: "Password set successfully! You can now use it for CLI/Extension login.",
      });

      // 2. Client-Side Update (No API call to /profile)
      if (user) {
        // Create updated user object
        const updatedUser = { ...user, hasSetPassword: true };

        // Update React State (Hides the form instantly)
        setUser(updatedUser);

        // Update LocalStorage (Persists changes on reload)
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Clear inputs
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Set password error:", error);
      setPasswordMsg({
        type: "error",
        text: error.response?.data?.error || "Failed to set password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <DashboardLayout>
      {/* 1. Welcome Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {user?.name || "there"}
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

      {/* Team & API Info + Set Password Section */}
      {(team || apiKey) && (
        <div className="mb-6 space-y-4">
          {/* Info Card */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {team && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Current Team
                  </span>
                  <p className="font-semibold text-foreground text-sm mt-1">
                    {team.name}
                  </p>
                </div>
              )}
              {apiKey && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    API Key
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-mono text-xs text-foreground bg-secondary px-2 py-1 rounded">
                      {apiKey.substring(0, 20)}...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Set Password Form (Only if hasSetPassword is false) */}
          {user && !user.hasSetPassword && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg text-orange-600 dark:text-orange-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Create a Password for CLI Access
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                    Since you signed up with Google/GitHub, you need to set a
                    local password to log in to the Renard CLI tool and Browser
                    Extension.
                  </p>

                  <form
                    onSubmit={handleSetPassword}
                    className="flex flex-col md:flex-row gap-3 items-start"
                  >
                    <div className="w-full md:w-auto">
                      <input
                        type="password"
                        placeholder="New Password"
                        className="w-full md:w-48 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-full md:w-auto">
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full md:w-48 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {passwordLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Set Password
                    </button>
                  </form>

                  {/* Feedback Messages */}
                  {passwordMsg && (
                    <div
                      className={`mt-3 text-sm font-medium flex items-center gap-2 ${
                        passwordMsg.type === "success"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500"
                      }`}
                    >
                      {passwordMsg.type === "success" && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {passwordMsg.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Activities"
          value={loading ? "..." : stats.totalActivities.toString()}
          label="logged"
          trend=""
          icon={<Activity className="w-5 h-5 text-primary" />}
        />
        <StatsCard
          title="Productivity Score"
          value={loading ? "..." : stats.productivityScore.toString()}
          label="/ 100"
          trend=""
          icon={<Brain className="w-5 h-5 text-purple-500" />}
        />
        <StatsCard
          title="Time Tracked"
          value={loading ? "..." : stats.totalHours.toFixed(1)}
          label="hours"
          trend=""
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Main Chart / Activity Area (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Heatmap */}
          {user && (
            <ActivityHeatmap
              userId={user.id}
              title="Your Activity (Last 90 Days)"
            />
          )}

          {/* Recent Context Logs */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-foreground">
                Recent Activities
              </h3>
              <button className="text-sm text-primary hover:underline">
                View All
              </button>
            </div>
            <div className="divide-y divide-border">
              {loading ? (
                <div className="px-6 py-8 text-center text-muted-foreground">
                  Loading activities...
                </div>
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <LogItem
                    key={activity.id}
                    source={activity.activityType}
                    title={activity.activityType}
                    time={new Date(activity.timestamp).toLocaleString()}
                    desc={activity.content}
                  />
                ))
              ) : (
                <div className="px-6 py-8 text-center text-muted-foreground">
                  No activities yet. Start using Renard to see your work logs
                  here.
                </div>
              )}
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
                  Getting Started
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start logging your activities using the Renard CLI or browser
                  extension. Your work will be tracked and searchable here.
                </p>
                <a
                  href="#"
                  className="mt-3 inline-block text-xs bg-primary text-white px-3 py-1.5 rounded-md font-medium shadow-sm hover:bg-primary/90"
                >
                  View Setup Guide
                </a>
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
        {trend && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
            {trend}
          </span>
        )}
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
