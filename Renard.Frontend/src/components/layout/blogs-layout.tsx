import React from "react";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "@/components/common/mode-toggle";
import logo from "@/assets/logo-Photoroom.png";
import { useNavigate } from "react-router-dom";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

export function BlogLayout({ children, title, lastUpdated }: LegalLayoutProps) {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-orange-500/30">
      {/* Header */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => {
              nav(-1);
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              nav("/");
            }}
          >
            <div className="w-6 h-6 rounded flex items-center justify-center text-primary-foreground font-bold text-xs">
              <img src={logo} />
            </div>
            <span className="font-bold text-lg">Renard</span>
          </div>
          <ModeToggle />
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6">
        {/* Typography Styles using standard Tailwind Prose-like styling manually for precise control */}
        <div className="space-y-12 leading-relaxed">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24 py-12 bg-secondary/20">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Renard. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <button
              onClick={() => {
                nav("/privacy");
              }}
              className="hover:text-primary underline underline-offset-4"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => {
                nav("/terms");
              }}
              className="hover:text-primary underline underline-offset-4"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
