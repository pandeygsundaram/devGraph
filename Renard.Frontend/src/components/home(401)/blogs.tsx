import React, { useState } from "react";

import { BookOpen, Rss, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "../common/navbar";
import { Footer } from "../common/footer";
import { CommonLayout } from "../layout/common-layout";
import { BlogLayout } from "../layout/blogs-layout";

export default function BlogPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      setEmail("");
    }, 1500);
  };

  return (
    <BlogLayout title="" lastUpdated="">
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <main className="flex-1 relative flex items-center justify-center py-20 overflow-hidden">
          {/* Background Patterns */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-sm font-medium text-muted-foreground mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Launching Q1 2026
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 w-full"
            >
              The Blog of <span className="text-primary">Context</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed mb-10"
            >
              We are crafting deep dives into LLM memory, developer
              productivity, Human-Computer Interaction (HCI), and the death of
              the daily standup.
            </motion.p>

            {/* Newsletter Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-md mx-auto"
            >
              {!isSubscribed ? (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <Rss className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background/50 backdrop-blur-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Notify Me <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-center gap-3 text-green-700 dark:text-green-300 animate-in fade-in zoom-in duration-300">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">
                    You're on the list! We'll be in touch.
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                No spam. Just high-signal engineering content. Unsubscribe
                anytime.
              </p>
            </motion.div>

            {/* Topics Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-20 pt-10 border-t border-border"
            >
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                Upcoming Topics
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {[
                  "Why RAG is failing your codebase",
                  "The psychology of flow state",
                  "Building a Rust CLI in 2026",
                ].map((topic, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-colors flex items-start gap-3 opacity-60 hover:opacity-100 cursor-default"
                  >
                    <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground">{topic}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </BlogLayout>
  );
}
