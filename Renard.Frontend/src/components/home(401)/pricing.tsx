import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Pricing = () => {
  const nav = useNavigate();
  return (
    <section className="py-24 bg-secondary/30" id="pricing">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-12">
          Simple, Transparent Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-colors text-left">
            <h3 className="text-lg font-semibold text-foreground">Starter</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                $0
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Perfect for solo hackers.
            </p>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> 7 days
                retention
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Basic
                Summaries
              </li>
            </ul>
            <button
              className="mt-8 w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg font-medium hover:bg-secondary/80"
              onClick={() => {
                nav("/signup");
              }}
            >
              Get Started
            </button>
          </div>

          {/* Pro */}
          <div className="bg-primary p-8 rounded-2xl border border-primary shadow-xl text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary/60 to-transparent w-20 h-20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <h3 className="text-lg font-semibold text-primary-foreground">
              Pro Team
            </h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold tracking-tight text-primary-foreground">
                $29
              </span>
              <span className="text-primary-foreground/90 ml-1">/dev/mo</span>
            </div>
            <p className="mt-2 text-sm text-primary-foreground/90">
              For fast-moving startups.
            </p>
            <ul className="mt-6 space-y-4 text-sm text-primary-foreground/90">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />{" "}
                Unlimited retention
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />{" "}
                Full Vector Search
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />{" "}
                Admin Dashboards
              </li>
            </ul>
            <button className="mt-8 w-full bg-primary-foreground text-primary py-2.5 rounded-lg font-bold hover:bg-primary-foreground/90">
              Start Trial
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-colors text-left">
            <h3 className="text-lg font-semibold text-foreground">
              Enterprise
            </h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                Custom
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              For large organizations.
            </p>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> On-premise
                deployment
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Custom SSO
              </li>
            </ul>
            <button className="mt-8 w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg font-medium hover:bg-secondary/80">
              Lets Talk
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
