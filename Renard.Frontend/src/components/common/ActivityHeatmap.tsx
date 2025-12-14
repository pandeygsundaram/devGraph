import { useEffect, useState } from "react";
import axios from "axios";

interface HeatmapDataPoint {
  date: string;
  count: number;
  hours: number;
}

interface ActivityHeatmapProps {
  userId: string;
  teamId?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
}

export function ActivityHeatmap({
  userId,
  teamId,
  startDate,
  endDate,
  title = "Activity Heatmap",
}: ActivityHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalActivities, setTotalActivities] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const API_URL = import.meta.env.VITE_SERVER;

  useEffect(() => {
    fetchHeatmapData();
  }, [userId, teamId, startDate, endDate]);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (teamId) params.append("teamId", teamId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await axios.get(
        `${API_URL}/activities/heatmap/${userId}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHeatmapData(response.data.heatmapData || []);
      setTotalActivities(response.data.totalActivities || 0);
      setTotalHours(response.data.totalHours || 0);
      setError("");
    } catch (err: any) {
      console.error("Error fetching heatmap data:", err);
      setError("Failed to load activity data");
    } finally {
      setLoading(false);
    }
  };

  const getColorIntensity = (count: number): string => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    if (count < 5) return "bg-green-200 dark:bg-green-900";
    if (count < 10) return "bg-green-400 dark:bg-green-700";
    if (count < 20) return "bg-green-600 dark:bg-green-500";
    return "bg-green-800 dark:bg-green-400";
  };

  // Generate grid for last 90 days if no data
  const generateDateGrid = () => {
    const today = new Date();
    const days = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dataPoint = heatmapData.find((d) => d.date === dateStr);
      days.push({
        date: dateStr,
        count: dataPoint?.count || 0,
        hours: dataPoint?.hours || 0,
      });
    }
    return days;
  };

  const dateGrid = generateDateGrid();

  // Group by weeks for display
  const weeks: HeatmapDataPoint[][] = [];
  for (let i = 0; i < dateGrid.length; i += 7) {
    weeks.push(dateGrid.slice(i, i + 7));
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading activity data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {totalActivities}
          </span>{" "}
          activities in{" "}
          <span className="font-medium text-foreground">
            {totalHours.toFixed(1)}
          </span>{" "}
          hours
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                const monthDay = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getColorIntensity(
                      day.count
                    )} hover:ring-2 hover:ring-primary cursor-pointer transition-all group relative`}
                    title={`${monthDay}: ${day.count} activities, ${day.hours.toFixed(
                      1
                    )} hours`}
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
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
          <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
