'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const { refreshProfile } = useAuthStore();

  useEffect(() => {
    // Refresh user profile to get updated subscription info
    refreshProfile();
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card>
          <CardBody className="text-center py-12">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-[var(--success)]" />
                <Sparkles className="w-8 h-8 text-[var(--primary)] absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
              Welcome to Premium!
            </h1>

            <p className="text-[var(--muted-foreground)] mb-8">
              Your subscription has been activated successfully. You can now create more evaluations and access all premium features.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/dashboard/new-evaluation')}
                className="w-full"
                size="lg"
              >
                Create Your First Evaluation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)]">
                Need help getting started?{' '}
                <Link
                  href="/dashboard/api-docs"
                  className="text-[var(--primary)] hover:underline"
                >
                  Check out our documentation
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
