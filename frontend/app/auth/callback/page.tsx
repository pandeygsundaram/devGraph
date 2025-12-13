'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { authApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        let errorMessage = 'Authentication failed';

        switch (error) {
          case 'no_code':
            errorMessage = 'No authorization code received';
            break;
          case 'no_token':
            errorMessage = 'No token received from Google';
            break;
          case 'invalid_token':
            errorMessage = 'Invalid Google token';
            break;
          case 'auth_failed':
            errorMessage = 'Google authentication failed';
            break;
          case 'auth_init_failed':
            errorMessage = 'Failed to initiate Google authentication';
            break;
        }

        toast.error(errorMessage);
        router.push('/login');
        return;
      }

      if (!token) {
        toast.error('No authentication token received');
        router.push('/login');
        return;
      }

      try {
        setToken(token);
        const response = await authApi.getProfile();

        if (response.user) {
          setUser(response.user);
          toast.success('Logged in successfully!');
          router.push('/dashboard');
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('Failed to complete authentication');
        setToken(null);
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, setToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
