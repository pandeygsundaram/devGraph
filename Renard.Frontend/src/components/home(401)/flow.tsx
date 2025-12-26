import React from "react";
import { Globe, Terminal, Code2, Brain, Search } from "lucide-react";

const SourceCard = ({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) => (
  <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all w-full md:w-48 z-20">
    <div className="p-2 bg-secondary rounded-lg text-primary">{icon}</div>
    <div>
      <div className="font-semibold text-sm text-card-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  </div>
);

export const FlowSection = () => {
  return (
    <section className="py-24 bg-background" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The Neural Network of Your Team
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Renard connects the dots between your scattered development logs.
          </p>
        </div>

        <div className="relative bg-secondary/30 border border-border rounded-3xl p-8 lg:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
            {/* Inputs */}
            <div className="flex flex-col gap-6">
              <SourceCard
                icon={<Globe className="w-5 h-5" />}
                title="Browser Ext"
                sub="ChatGPT, Claude"
              />
              <SourceCard
                icon={<Terminal className="w-5 h-5" />}
                title="CLI Reader"
                sub="Terminal Logs"
              />
              <SourceCard
                icon={<Code2 className="w-5 h-5" />}
                title="IDE Ext"
                sub="VS Code, Cursor"
              />
            </div>

            {/* Animated Beams */}
            <div className="hidden md:flex flex-1 h-[300px] items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 50 50 C 150 50, 150 150, 250 150"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="2"
                  className="text-foreground"
                />
                <path
                  d="M 50 150 C 150 150, 150 150, 250 150"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="2"
                  className="text-foreground"
                />
                <path
                  d="M 50 250 C 150 250, 150 150, 250 150"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="2"
                  className="text-foreground"
                />

                <circle r="3" className="fill-primary">
                  <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path="M 50 50 C 150 50, 150 150, 250 150"
                  />
                </circle>
                <circle r="3" className="fill-primary">
                  <animateMotion
                    dur="2s"
                    begin="0.5s"
                    repeatCount="indefinite"
                    path="M 50 150 C 150 150, 150 150, 250 150"
                  />
                </circle>
                <circle r="3" className="fill-primary">
                  <animateMotion
                    dur="2s"
                    begin="1s"
                    repeatCount="indefinite"
                    path="M 50 250 C 150 250, 150 150, 250 150"
                  />
                </circle>
              </svg>

              {/* Central Processor */}
              <div className="relative w-32 h-32 bg-card rounded-2xl border border-border shadow-xl flex flex-col items-center justify-center z-20">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/80 rounded-2xl blur opacity-20"></div>
                <Brain className="w-10 h-10 text-foreground mb-2" />
                <span className="text-xs font-bold text-muted-foreground">
                  Context Engine
                </span>
              </div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 450 150 C 550 150, 550 150, 650 150"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="2"
                  className="text-foreground"
                />
                <circle r="3" className="fill-primary">
                  <animateMotion
                    dur="1.5s"
                    repeatCount="indefinite"
                    path="M 450 150 C 550 150, 550 150, 650 150"
                  />
                </circle>
              </svg>
            </div>
            <div className="block md:hidden h-8 border-l-2 border-dashed border-border"></div>
            {/* Output */}
            <div className="w-full md:w-64 bg-card rounded-xl border border-border shadow-sm p-4 z-20">
              <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Search knowledge...
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-3/4 bg-secondary rounded"></div>
                <div className="h-2 w-1/2 bg-secondary rounded"></div>
                <div className="h-16 w-full bg-primary/10 rounded border border-primary/30 p-2 mt-2">
                  <div className="text-[10px] text-primary font-medium">
                    Insight Generated
                  </div>
                  <div className="h-1.5 w-5/6 bg-primary/30 rounded mt-1"></div>
                  <div className="h-1.5 w-4/6 bg-primary/30 rounded mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
