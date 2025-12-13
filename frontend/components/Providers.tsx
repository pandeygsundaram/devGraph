'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/lib/stores/authStore';
import { ThemeProvider } from '@/components/ThemeProvider';

function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthInitializer />
      {children}
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}
