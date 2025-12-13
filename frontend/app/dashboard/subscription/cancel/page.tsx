'use client';

import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card>
          <CardBody className="text-center py-12">
            <div className="mb-6 flex justify-center">
              <XCircle className="w-20 h-20 text-[var(--warning)]" />
            </div>

            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
              Payment Cancelled
            </h1>

            <p className="text-[var(--muted-foreground)] mb-8">
              Your payment was cancelled. No charges have been made to your account.
              You can try again whenever you're ready.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/pricing')}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)]">
                Questions about pricing?{' '}
                <a
                  href="mailto:support@visaeval.com"
                  className="text-[var(--primary)] hover:underline"
                >
                  Contact our support team
                </a>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
