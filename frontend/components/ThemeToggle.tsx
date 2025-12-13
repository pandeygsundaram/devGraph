'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/lib/stores/themeStore';

export function ThemeToggle() {
  const { toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent hover:bg-[var(--muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[var(--foreground)]" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[var(--foreground)]" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
