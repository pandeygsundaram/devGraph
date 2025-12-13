'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import Link from 'next/link';
import { ArrowRight, Globe, FileText, Zap, Shield, Key } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-[var(--primary)]" />
              <span className="ml-2 text-xl font-bold text-[var(--foreground)]">VisaEval</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/pricing"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 px-4 py-2 rounded-md text-sm font-semibold transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-[var(--foreground)] mb-6 leading-tight">
            Evaluate Your Visa
            <br />
            <span className="text-[var(--primary)]">Eligibility in Minutes</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--muted-foreground)] mb-8 max-w-3xl mx-auto">
            AI-powered visa evaluation platform. Upload your documents and get instant
            analysis for visa eligibility across multiple countries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center"
            >
              Start Free Evaluation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] px-8 py-4 rounded-lg text-lg font-semibold transition-all border border-[var(--border)]"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-4">
            2 free evaluations • No credit card required
          </p>
        </div>
      </section>

      {/* Feature Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 shadow-2xl">
            <div className="aspect-video bg-[var(--muted)] rounded-lg border border-[var(--border)] flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-24 w-24 text-[var(--primary)] mx-auto mb-4" />
                <p className="text-[var(--muted-foreground)] text-lg">Upload documents and get instant analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--muted)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] text-center mb-16">
            Why Choose VisaEval?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Analysis',
                description: 'Get your visa eligibility results in minutes, not days. Our AI processes your documents instantly.',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your documents are encrypted and stored securely. We never share your information.',
              },
              {
                icon: Key,
                title: 'Easy API Integration',
                description: 'Use simple API keys to integrate visa evaluation into your system. Developer-friendly documentation and instant access.',
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-[var(--card)] rounded-xl p-8 border border-[var(--border)] hover:border-[var(--primary)] transition-all transform hover:scale-105"
              >
                <div className="inline-block p-3 rounded-lg bg-[var(--primary)]/10 mb-4">
                  <feature.icon className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">{feature.title}</h3>
                <p className="text-[var(--muted-foreground)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] text-center mb-16">
            Simple 3-Step Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Documents',
                description: 'Upload your resume, passport, and other required documents securely.'
              },
              {
                step: '02',
                title: 'AI Analysis',
                description: 'Our AI evaluates your documents against visa requirements.'
              },
              {
                step: '03',
                title: 'Get Results',
                description: 'Receive detailed eligibility report with recommendations.'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-[var(--primary)] opacity-20 mb-4">{item.step}</div>
                <h3 className="text-2xl font-semibold text-[var(--foreground)] mb-3">{item.title}</h3>
                <p className="text-[var(--muted-foreground)]">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[var(--primary)] to-transparent -translate-x-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-[var(--primary)] rounded-2xl p-12 text-center overflow-hidden">
            {/* Gradient overlay - brighter at bottom, fading to top */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/[0.40] via-white/[0.10] to-white/[0.02] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--primary-foreground)] mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-[var(--primary-foreground)] opacity-90 mb-8">
                Start with 2 free evaluations. Upgrade anytime for unlimited access.
              </p>
              <Link
                href="/signup"
                className="inline-block bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--card)] px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg relative overflow-hidden group"
              >
                {/* Button gradient overlay */}
                <span className="absolute inset-0 bg-gradient-to-t from-white/[0.25] via-white/[0.08] to-white/[0.03] opacity-100 group-hover:opacity-80 transition-opacity pointer-events-none rounded-lg" />
                <span className="relative z-10">Start Free Evaluation</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--card)] border-t border-[var(--border)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Globe className="h-6 w-6 text-[var(--primary)]" />
              <span className="ml-2 text-lg font-bold text-[var(--foreground)]">VisaEval</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-[var(--muted-foreground)]">
              <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            © 2025 VisaEval. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
