'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Only redirect after hydration is complete
    if (isHydrated && !isLoading && !isAuthenticated && !token) {
      console.log('🔒 Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, token, isHydrated, router]);

  // Show loading while hydrating or loading
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // After hydration, check authentication
  if (!isAuthenticated && !token) {
    return null;
  }

  return <>{children}</>;
}
