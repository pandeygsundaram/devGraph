import { Search, BarChart3, CheckCircle2, Brain } from "lucide-react";

export const Features = () => {
  return (
    <section className="py-24 bg-background" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground">
            Platform Capabilities
          </h2>
          <p className="mt-2 text-muted-foreground">
            Everything you need to maintain momentum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Semantic Search */}
          <div className="md:col-span-2 bg-secondary/20 rounded-3xl p-8 border border-border min-h-[300px] relative overflow-hidden group hover:border-primary/20 transition-colors">
            <div className="absolute top-8 left-8 z-10">
              <div className="p-3 bg-card rounded-xl w-fit shadow-sm mb-4 border border-border">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Semantic Context Search
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Don't ask "Who worked on this?". Ask the database. Retrieve code
                snippets, decision logs, and chat context instantly.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 w-1/2 h-3/4 bg-card rounded-tl-3xl border-t border-l border-border shadow-lg p-6 translate-y-4 translate-x-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-400 mt-1"></div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Query: "Why did we switch to Shadcn?"
                  </div>
                </div>
                <div className="p-3 bg-secondary rounded text-xs text-foreground leading-relaxed">
                  Based on Claude logs from Oct 12, the team decided to switch
                  for better accessibility compliance...
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Analytics (Dark Themed) */}
          <div className="bg-neutral-900 dark:bg-black text-white rounded-3xl p-8 border border-neutral-800 min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="p-3 bg-white/10 rounded-xl w-fit mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Admin Insights</h3>
              <p className="text-neutral-400 mt-2 text-sm">
                Visualize productivity trends without nagging your devs for
                status updates.
              </p>
            </div>
            <div className="flex gap-1 items-end h-16 mt-4">
              <div className="w-full bg-neutral-800 rounded-t h-[40%]"></div>
              <div className="w-full bg-neutral-700 rounded-t h-[70%]"></div>
              <div className="w-full bg-primary rounded-t h-[100%]"></div>
              <div className="w-full bg-neutral-700 rounded-t h-[60%]"></div>
            </div>
          </div>

          {/* Card 3: Summaries */}
          <div className="bg-card rounded-3xl p-8 border border-border min-h-[300px]">
            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Auto-Summaries
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Daily standup text generated automatically from Git commits and AI
              usage logs.
            </p>
          </div>

          {/* Card 4: Knowledge (Gradient) */}
          <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 border border-primary text-primary-foreground min-h-[300px] relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold">
                Preserve Institutional Knowledge
              </h3>
              <p className="text-primary-foreground/90 mt-2 max-w-lg">
                When a senior dev leaves, their context stays. Our vector
                database ensures seamless handovers.
              </p>
            </div>
            <Brain className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-10" />
          </div>
        </div>
      </div>
    </section>
  );
};
