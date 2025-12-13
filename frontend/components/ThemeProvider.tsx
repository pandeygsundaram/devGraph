'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, initialize } = useThemeStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Sync theme with document element whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
