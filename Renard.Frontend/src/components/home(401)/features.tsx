import { Search, BarChart3, CheckCircle2, Brain, History } from "lucide-react";

export const Features = () => {
  return (
    <section className="py-24 bg-background" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground">
            Platform Capabilities
          </h2>
          <p className="mt-2 text-muted-foreground">
            Don't rely on memory. Outfox the chaos of turnover and
            documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Semantic Search (Large) */}
          <div className="md:col-span-2 bg-secondary/20 rounded-3xl p-8 border border-border min-h-[300px] relative overflow-hidden group hover:border-primary/20 transition-colors">
            <div className="absolute top-8 left-8 z-10">
              <div className="p-3 bg-card rounded-xl w-fit shadow-sm mb-4 border border-border">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Semantic Context Search
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Stop tapping shoulders. Ask the database. Retrieve code
                decisions, architectural reasoning, and AI chat context
                instantly from any point in time.
              </p>
            </div>
            {/* Visual Element */}
            <div className="hidden sm:block absolute right-0 bottom-0 w-1/2 h-3/4 bg-card rounded-tl-3xl border-t border-l border-border shadow-lg p-6 translate-y-4 translate-x-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-400 mt-1"></div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Query: "Why did John use Redux here?"
                  </div>
                </div>
                <div className="p-3 bg-secondary rounded text-xs text-foreground leading-relaxed">
                  Based on logs from Jan 2024, John chose Redux to handle
                  complex state...
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Developer Lifecycle Tracking (Dark/High Contrast) */}
          <div className="bg-neutral-900 dark:bg-black text-white rounded-3xl p-8 border border-neutral-800 min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="p-3 bg-white/10 rounded-xl w-fit mb-4">
                <History className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Lifecycle Timeline</h3>
              <p className="text-neutral-400 mt-2 text-sm">
                Track a developer's impact from Day 1 to Day 1000. See what they
                built, what they solved, and their core contributions over their
                entire tenure.
              </p>
            </div>
            {/* Visual Graph */}
            <div className="flex gap-1 items-end h-16 mt-4 opacity-80">
              <div className="w-1/4 bg-neutral-800 rounded-t h-[30%]"></div>
              <div className="w-1/4 bg-neutral-700 rounded-t h-[50%]"></div>
              <div className="w-1/4 bg-neutral-600 rounded-t h-[80%]"></div>
              <div className="w-1/4 bg-primary rounded-t h-[100%] shadow-[0_0_15px_-3px_var(--color-primary)]"></div>
            </div>
          </div>

          {/* Card 3: Auto-Summaries */}
          <div className="bg-card rounded-3xl p-8 border border-border min-h-[300px]">
            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Zero-Touch Reporting
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Generate daily standups or monthly impact reports automatically.
              We synthesize Git commits and AI logs into human-readable
              summaries.
            </p>
          </div>

          {/* Card 4: Institutional Knowledge (Gradient / Hero Feature) */}
          <div className="md:col-span-2 bg-gradient-to-br from-primary to-orange-700 dark:to-orange-900 rounded-3xl p-8 border border-primary text-primary-foreground min-h-[300px] relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold">
                Immortalize Institutional Knowledge
              </h3>
              <p className="text-primary-foreground/90 mt-2 max-w-lg leading-relaxed">
                When a developer leaves, they usually take their knowledge with
                them. Not anymore. Dont depend on docs or tickets, Renard captures their logic, context, and
                decisions automatically, so you don't need exit interviews to
                understand your own code.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/10">
                <Brain className="w-4 h-4" />
                <span>Bus Factor = ∞</span>
              </div>
            </div>

            {/* Background Decoration */}
            <Brain className="absolute -bottom-12 -right-12 w-80 h-80 text-white opacity-10 rotate-12" />
          </div>
        </div>
      </div>
    </section>
  );
};
