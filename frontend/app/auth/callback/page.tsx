'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { authApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';

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
        // Set the token
        setToken(token);

        // Fetch user profile
        const response = await authApi.getProfile();

        if (response.success) {
          setUser(response.data.user);
          toast.success('Logged in successfully with Google!');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
