'use client';

import { useRouter } from 'next/navigation';
import { X, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: {
    name: string;
    tier: string;
    callLimit: number;
  };
  usage?: {
    used: number;
    limit: number;
  };
}

export function QuotaExceededModal({
  isOpen,
  onClose,
  currentPlan,
  usage
}: QuotaExceededModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    router.push('/pricing');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--warning)]/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-[var(--warning)]" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Evaluation Limit Reached
            </h2>
            <p className="text-[var(--muted-foreground)]">
              You've used all <strong>{usage?.limit || currentPlan?.callLimit || 0}</strong> evaluations
              in your {currentPlan?.name || 'Free'} plan this month.
            </p>
          </div>

          {/* Usage Stats */}
          {usage && (
            <div className="bg-[var(--muted)] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-foreground)]">Usage this month</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {usage.used} / {usage.limit}
                </span>
              </div>
              <div className="w-full bg-[var(--background)] rounded-full h-2">
                <div
                  className="bg-[var(--warning)] h-2 rounded-full transition-all"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* Upgrade CTA */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full"
              size="lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Upgrade to Pro
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>

          {/* Benefits */}
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted-foreground)] text-center">
              Upgrade to unlock thousands of evaluations per month,
              priority processing, and advanced features.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
