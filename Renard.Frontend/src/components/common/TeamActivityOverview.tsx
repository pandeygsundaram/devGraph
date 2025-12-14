import { useEffect, useState } from "react";
import axios from "axios";
import { Users } from "lucide-react";

interface HeatmapDataPoint {
  date: string;
  count: number;
  hours: number;
}

interface MemberActivity {
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: string;
  heatmapData: HeatmapDataPoint[];
  totalActivities: number;
  totalHours: number;
}

interface TeamActivityOverviewProps {
  teamId: string;
  startDate?: string;
  endDate?: string;
}

export function TeamActivityOverview({
  teamId,
  startDate,
  endDate,
}: TeamActivityOverviewProps) {
  const [members, setMembers] = useState<MemberActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_SERVER;

  useEffect(() => {
    fetchTeamActivity();
  }, [teamId, startDate, endDate]);

  const fetchTeamActivity = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await axios.get(
        `${API_URL}/activities/team/${teamId}/members?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMembers(response.data.members || []);
      setError("");
    } catch (err: any) {
      console.error("Error fetching team activity:", err);
      setError("Failed to load team activity data");
    } finally {
      setLoading(false);
    }
  };

  const getColorIntensity = (count: number): string => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    if (count < 5) return "bg-blue-200 dark:bg-blue-900";
    if (count < 10) return "bg-blue-400 dark:bg-blue-700";
    if (count < 20) return "bg-blue-600 dark:bg-blue-500";
    return "bg-blue-800 dark:bg-blue-400";
  };

  const generateDateGrid = (memberData: HeatmapDataPoint[]) => {
    const today = new Date();
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dataPoint = memberData.find((d) => d.date === dateStr);
      days.push({
        date: dateStr,
        count: dataPoint?.count || 0,
        hours: dataPoint?.hours || 0,
      });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Team Activity</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading team data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Team Activity</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Team Activity</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Last 30 days · {members.length} members
        </div>
      </div>

      {/* Members List with Mini Heatmaps */}
      <div className="space-y-4">
        {members.map((member) => {
          const dateGrid = generateDateGrid(member.heatmapData);

          return (
            <div
              key={member.user.id}
              className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">
                      {member.user.name}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {member.role}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium text-foreground">
                    {member.totalActivities}
                  </div>
                  <div className="text-muted-foreground">activities</div>
                </div>
              </div>

              {/* Mini Heatmap */}
              <div className="flex gap-1">
                {dateGrid.map((day, index) => {
                  const date = new Date(day.date);
                  const monthDay = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={index}
                      className={`w-2 h-6 rounded-sm ${getColorIntensity(
                        day.count
                      )} hover:ring-2 hover:ring-primary cursor-pointer transition-all group relative`}
                      title={`${monthDay}: ${day.count} activities`}
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border border-border whitespace-nowrap z-10 transition-opacity pointer-events-none">
                        <div className="font-medium">{monthDay}</div>
                        <div className="text-muted-foreground">
                          {day.count} activities
                        </div>
                        <div className="text-muted-foreground">
                          {day.hours.toFixed(1)} hours
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="mt-2 text-xs text-muted-foreground">
                {member.totalHours.toFixed(1)} hours total
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No team members found
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900" />
          <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-700" />
          <div className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-500" />
          <div className="w-3 h-3 rounded-sm bg-blue-800 dark:bg-blue-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
