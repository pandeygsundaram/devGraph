import React from "react";
import logo from "@/assets/logo-Photoroom.png";
import { useNavigate } from "react-router-dom";
interface AuthLayoutProps {
  children: React.ReactNode;
  quote?: string;
  author?: string;
  role?: string;
}

export function AuthLayout({
  children,
  quote = "Renard has completely transformed how we track engineering velocity. It's like having a photographic memory for our codebase.",
  author = "Sofia Davis",
  role = "CTO at Acme Inc",
}: AuthLayoutProps) {
  const nav = useNavigate();
  return (
    // Uses bg-background for the overall container
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background text-foreground">
      {/* Left Panel - Branding (Fixed Dark Theme for aesthetic contrast) */}
      <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white lg:flex dark:border-r border-zinc-800">
        <div className="absolute inset-0 bg-zinc-900" />
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Orange Glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-primary/40 to-transparent"></div>

        {/* Logo */}
        <div
          className="relative z-20 flex flex-col items-center mt-80 text-2xl font-medium gap-2"
          onClick={() => {
            nav("/");
          }}
        >
          <div className="w-24 h-24 z-50">
            <img src={logo} />
          </div>
          Renard
        </div>

        {/* Testimonial */}
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">&ldquo;{quote}&rdquo;</p>
            <footer className="text-sm text-zinc-400">
              {author}, <span className="text-zinc-500">{role}</span>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel - Form (Adapts to Theme) */}
      <div className="lg:p-8 relative h-full flex items-center justify-center bg-background">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] px-4 md:px-0">
          {children}
        </div>
      </div>
    </div>
  );
}
