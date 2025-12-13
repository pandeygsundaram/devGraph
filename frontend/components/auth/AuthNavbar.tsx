'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AuthNavbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-[var(--primary)]" />
            <span className="text-xl font-bold text-[var(--foreground)]">VisaEval</span>
          </Link>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/pricing"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Pricing
            </Link>
            {isLoginPage ? (
              <Link
                href="/signup"
                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 px-4 py-2 rounded-md text-sm font-semibold transition-all"
              >
                Sign up
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 px-4 py-2 rounded-md text-sm font-semibold transition-all"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
