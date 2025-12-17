import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Globe,
  Terminal,
  Chrome,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Code2,
  Github,
  MousePointer2,
  Copy,
} from "lucide-react";
import { useState } from "react";

export default function IntegrationsPage() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("sudo npm install -g renard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const integrations = [
    {
      name: "Renard CLI Tool",
      description:
        "The core engine. Syncs terminal commands, LLM interactions, and development workflow automatically.",
      icon: Terminal,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-secondary",
      status: "live",
      command: "sudo npm install -g renard",
      links: [
        {
          label: "View on NPM",
          url: "https://www.npmjs.com/package/renard",
          type: "external",
        },
        {
          label: "Read Docs",
          url: "https://docs.renard.live/cli",
          type: "external",
        },
      ],
    },
    {
      name: "Chrome Extension",
      description:
        "Capture ChatGPT, Claude, and Gemini conversations directly from your browser tabs.",
      icon: Chrome,
      color: "text-orange-500",
      bgColor: "bg-secondary",
      status: "soon",
      links: [],
    },
    {
      name: "Firefox Extension",
      description:
        "Browser tracking and AI chat from ChatGPT, Claude, and Gemini capture support for Firefox users.",
      icon: Globe,
      color: "text-orange-600",
      bgColor: "bg-secondary",
      status: "soon",
      links: [],
    },
    {
      name: "VS Code Extension",
      description:
        "Native IDE integration to track prompts, file changes, and debugging sessions.",
      icon: Code2,
      color: "text-blue-500",
      bgColor: "bg-secondary",
      status: "upcoming",
      links: [],
    },
    {
      name: "Cursor IDE",
      description:
        "Deep integration with Cursor AI to log generated code and AI chats and summarize.",
      icon: MousePointer2,
      color: "text-purple-500",
      bgColor: "bg-secondary",
      status: "upcoming",
      links: [],
    },
    {
      name: "GitHub Workflow",
      description:
        "CI/CD integration for repo-wise summarization and commit context analysis.",
      icon: Github,
      color: "text-foreground",
      bgColor: "bg-secondary",
      status: "upcoming",
      links: [],
    },
  ];

  // Helper to render status badges
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/15 border border-green-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">
              Live Now
            </span>
          </div>
        );
      case "soon":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/15 border border-orange-500/20 rounded-full">
            <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            <span className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
        );
      case "upcoming":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary border border-border rounded-full">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50"></span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              Planned
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        </div>
        <p className="text-muted-foreground">
          Connect Renard with your development ecosystem.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.name}
              className={`
                bg-card border rounded-xl p-6 shadow-sm transition-all relative overflow-hidden
                ${
                  integration.status === "live"
                    ? "border-primary/40 ring-1 ring-primary/20"
                    : "border-border hover:border-border/80"
                }
              `}
            >
              {/* Status Badge Positioned Top Right */}
              <div className="absolute top-4 right-4">
                {renderStatusBadge(integration.status)}
              </div>

              {/* Icon */}
              <div className="flex items-start mb-4 mt-2">
                <div className={`p-3 ${integration.bgColor} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${integration.color}`} />
                </div>
              </div>

              {/* Title and Description */}
              <h3 className="text-lg font-bold text-foreground mb-2">
                {integration.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">
                {integration.description}
              </p>

              {/* Content Based on Status */}
              {integration.status === "live" ? (
                <div className="space-y-4">
                  {/* Copy Command Box */}
                  <div className="bg-secondary/50 border border-border rounded-lg p-3 flex items-center justify-between group hover:border-primary/30 transition-colors">
                    <code className="text-xs font-mono text-foreground break-all mr-2">
                      {integration.command}
                    </code>
                    <button
                      onClick={copyCommand}
                      className="p-1.5 hover:bg-background rounded-md text-muted-foreground hover:text-primary transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Links */}
                  <div className="gap-2 flex">
                    {integration.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                // Placeholder / Notify Button for Non-Live Items
                <div className="pt-2 border-t border-border">
                  <button
                    disabled
                    className="w-full py-2 text-sm text-muted-foreground font-medium bg-secondary/50 rounded-md cursor-not-allowed opacity-70"
                  >
                    {integration.status === "soon"
                      ? "In Development"
                      : "On Roadmap"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Start Guide */}
      <div className="mt-12 bg-card border border-border rounded-xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-6">
          Start Logging Today
        </h3>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex gap-4 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
              1
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">
                Install Renard CLI
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Open your terminal and run the installation command. This works
                on macOS, Linux, and Windows (WSL).
              </p>
            </div>
          </div>

          <div className="hidden md:block w-px bg-border"></div>

          <div className="flex gap-4 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Authenticate</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Run{" "}
                <code className="text-xs font-mono bg-secondary px-1 py-0.5 rounded">
                  renard login
                </code>{" "}
                in your terminal. This links your CLI to this dashboard.
              </p>
            </div>
          </div>

          <div className="hidden md:block w-px bg-border"></div>

          <div className="flex gap-4 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Auto-Sync</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                That's it! Renard runs in the background. Use Claude, Gemini, or
                Open Interpreter as usual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
