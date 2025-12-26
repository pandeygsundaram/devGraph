import { LegalLayout } from "@/components/layout/legal-layout";
import {
  Brain,
  GitMerge,
  Terminal,
  Coffee,
  Zap,
  Users,
  Globe,
  Code2,
  CalendarX,
  UserMinus,
  MessageSquareText,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CommonLayout } from "../layout/common-layout";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <CommonLayout
      title="We are Renard"
      lastUpdated="Building the Second Brain for Engineering Teams"
    >
      {/* 1. Mission Statement */}
      <section className="text-center max-w-4xl mx-auto mb-20">
        <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
          We believe that{" "}
          <span className="text-primary font-bold">
            context is the most valuable asset
          </span>{" "}
          a developer has. Yet, every day, we lose it to closed browser tabs,
          cleared terminal buffers, and forgotten chat logs.
        </p>
        <div className="mt-8 h-1 w-20 bg-primary mx-auto rounded-full"></div>
      </section>

      {/* 2. The Problem (Origin Story) */}
      <section className="mb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Terminal className="w-8 h-8 text-orange-500" />
            The "Black Hole" of Context
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
            <p>
              Every engineer knows the feeling: You spend 4 hours debugging a
              complex race condition. You use Claude to brainstorm, run 50
              commands in your terminal, and read 12 documentation pages.
            </p>
            <p>
              <strong>Then you fix it.</strong> You push a 3-line commit:{" "}
              <code>"fix: race condition in auth"</code>.
            </p>
            <p>
              Six months later, the bug returns. The context—the{" "}
              <em>journey</em> to the solution—is gone. The chat logs are
              buried, the terminal history is overwritten. You have to start
              from scratch.
            </p>
            <p className="text-foreground font-medium border-l-4 border-primary pl-4 italic">
              Renard was built to stop this cycle. We capture the journey, not
              just the destination.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl"></div>
          <div className="relative bg-card border border-border p-8 rounded-3xl shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                <Code2 className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-mono">
                  VS Code: Modified auth-provider.ts
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                <Terminal className="w-5 h-5 text-foreground" />
                <span className="text-sm font-mono">
                  CLI: npm test -- --watch
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                <Globe className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-mono">
                  Chrome: "React Query cache invalidation..."
                </span>
              </div>
              <div className="h-8 border-l-2 border-dashed border-border ml-48"></div>
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary text-center font-bold">
                Renard Knowledge Graph
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Culture Shift (New Section for Managers/Process) */}
      <section className="mb-20">
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Cut the "Management" Crap
            </h2>
            <p className="text-lg text-muted-foreground">
              We built Renard to kill the two most painful parts of engineering
              management:
              <span className="text-foreground font-semibold">
                {" "}
                The Daily Standup
              </span>{" "}
              and
              <span className="text-foreground font-semibold">
                {" "}
                The Exit Interview
              </span>
              .
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            {/* Feature 1 */}
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-xl border border-border shadow-sm">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg flex items-center justify-center mb-4">
                <CalendarX className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Kill the Standup</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stop interrupting deep work to ask "What did you do yesterday?".
                Renard auto-generates daily summaries based on actual Git
                commits and CLI activity.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-xl border border-border shadow-sm">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                <UserMinus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                The Exit Interview is Dead
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When a dev leaves, they usually take their knowledge with them.
                Renard immortalizes their context. Search their history even
                after they've offboarded.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-xl border border-border shadow-sm">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Async Pulse Checks</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Managers can "Chat with the Repo" to understand progress,
                blockers, and architectural decisions without ever tapping a
                developer on the shoulder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Philosophy */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Our Philosophy</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <PhilosophyCard
            icon={<Brain className="w-6 h-6 text-purple-500" />}
            title="Intelligence, Not Spyware"
            desc="We are developers. We hate metrics like 'lines of code' or 'hours online'. Renard tracks *context*, not surveillance."
          />
          <PhilosophyCard
            icon={<GitMerge className="w-6 h-6 text-blue-500" />}
            title="Seamless Integration"
            desc="If you have to manually log your work, we've failed. Renard runs in the background, quietly weaving your activity into insights."
          />
          <PhilosophyCard
            icon={<Zap className="w-6 h-6 text-yellow-500" />}
            title="Speed is a Feature"
            desc="Our CLI is written in Rust/Go. Our extension is lightweight. We ensure zero latency added to your development machine."
          />
        </div>
      </section>

      {/* 5. The Technology */}
      <section className="mb-20 bg-secondary/20 rounded-3xl p-8 md:p-12 border border-border text-center">
        <h2 className="text-3xl font-bold mb-6">How it Actually Works</h2>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-10">
          Renard isn't magic. It's a sophisticated data pipeline that turns
          unstructured logs into a queryable semantic vector database.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 bg-background rounded-xl border border-border">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-2">
              Step 1
            </div>
            <div className="font-bold">Ingestion</div>
            <div className="text-xs text-muted-foreground mt-1">
              Parsers for Chrome, Zsh, Bash, VS Code
            </div>
          </div>
          <div className="p-4 bg-background rounded-xl border border-border">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-2">
              Step 2
            </div>
            <div className="font-bold">Sanitization</div>
            <div className="text-xs text-muted-foreground mt-1">
              PII Removal, Secret Scrubbing, Noise Filtering
            </div>
          </div>
          <div className="p-4 bg-background rounded-xl border border-border">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-2">
              Step 3
            </div>
            <div className="font-bold">Embedding</div>
            <div className="text-xs text-muted-foreground mt-1">
              Vectorizing text using high-dimensional models
            </div>
          </div>
          <div className="p-4 bg-background rounded-xl border border-border">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-2">
              Step 4
            </div>
            <div className="font-bold">Synthesis</div>
            <div className="text-xs text-muted-foreground mt-1">
              LLM Agents generate summaries & insights
            </div>
          </div>
        </div>
      </section>

      {/* 6. Team / Culture */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Built by Builders
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Renard started as a weekend hackathon project by engineers
              frustrated with writing standup reports.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Today, we are a small, distributed team of engineers, designers,
              and researchers passionate about{" "}
              <strong>Human-Computer Interaction (HCI)</strong> and the future
              of work.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm font-medium">
                <Coffee className="w-4 h-4" /> 100% Remote
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm font-medium">
                <Globe className="w-4 h-4" /> Building
              </div>
            </div>
          </div>

          {/* Abstract Team Visual */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-4xl transform hover:rotate-3 transition-transform duration-300">
              🦊
            </div>
            <div className="aspect-square bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-4xl transform hover:-rotate-3 transition-transform duration-300 mt-8">
              👩‍💻
            </div>
            <div className="aspect-square bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-4xl transform hover:-rotate-3 transition-transform duration-300 -mt-8">
              🛠️
            </div>
            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-4xl transform hover:rotate-3 transition-transform duration-300">
              🚀
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="text-center py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-6">
          Ready to regain your context?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Join thousands of developers who have stopped relying on their memory
          and started relying on Renard.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95"
          >
            Start for Free
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 bg-secondary text-foreground rounded-full text-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Login
          </button>
        </div>
      </section>
    </CommonLayout>
  );
}

function PhilosophyCard({
  icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/30 transition-colors">
      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
