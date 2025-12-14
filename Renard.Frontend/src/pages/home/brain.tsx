import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KnowledgeGraph } from "@/components/common/KnowledgeGraph";
import { KnowledgeChat } from "@/components/common/KnowledgeChat";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";

export default function BrainPage() {
  const [teamId, setTeamId] = useState<string>("");

  useEffect(() => {
    const teamData = localStorage.getItem("team");
    if (teamData) {
      const team = JSON.parse(teamData);
      setTeamId(team.id);
    }
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Knowledge Brain
          </h1>
        </div>
        <p className="text-muted-foreground">
          Explore your work patterns and search through your activity history
        </p>
      </div>

      {/* Knowledge Graph */}
      <div className="mb-8">
        <KnowledgeGraph teamId={teamId} />
      </div>

      {/* Chat Interface */}
      <div>
        <KnowledgeChat teamId={teamId} />
      </div>
    </DashboardLayout>
  );
}
