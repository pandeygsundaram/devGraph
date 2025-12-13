'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface SubscriptionDetails {
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    callsUsed: number;
    callsRemaining: number;
  } | null;
  plan: {
    _id: string;
    name: string;
    tier: string;
    price: number;
    billingPeriod: string;
    callLimit: number;
    features: string[];
  };
  isActive: boolean;
  onFreePlan: boolean;
}

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptionDetails(data.data);
      } else {
        toast.error('Failed to load subscription details');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Subscription cancelled successfully');
        fetchSubscriptionDetails(); // Refresh
      } else {
        toast.error(data.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  const handleManageBilling = async () => {
    setLoadingPortal(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/billing-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/subscription/manage`
        })
      });

      const data = await response.json();

      if (data.success && data.data.url) {
        // Redirect to Stripe billing portal
        window.location.href = data.data.url;
      } else {
        toast.error(data.message || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setLoadingPortal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!subscriptionDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted-foreground)]">Failed to load subscription details</p>
      </div>
    );
  }

  const { subscription, plan, isActive, onFreePlan } = subscriptionDetails;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          Subscription Management
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Current Plan</h2>
            {isActive && !onFreePlan ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]">
                Active
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
                Free Plan
              </span>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Details */}
            <div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                {plan.name}
              </h3>
              {!onFreePlan && (
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[var(--foreground)]">
                    ${(plan.price / 100).toFixed(0)}
                  </span>
                  <span className="text-[var(--muted-foreground)] ml-2">
                    / {plan.billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              )}

              <ul className="space-y-2">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle className="w-4 h-4 text-[var(--success)] mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--foreground)]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Usage Stats */}
            <div className="space-y-4">
              {subscription && !onFreePlan && (
                <>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[var(--muted-foreground)]">Usage this period</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {subscription.callsUsed} / {plan.callLimit}
                      </span>
                    </div>
                    <div className="w-full bg-[var(--muted)] rounded-full h-2">
                      <div
                        className="bg-[var(--primary)] h-2 rounded-full transition-all"
                        style={{ width: `${(subscription.callsUsed / plan.callLimit) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-start pt-2">
                    <Calendar className="w-4 h-4 text-[var(--muted-foreground)] mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">Next billing date</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="flex items-start p-3 bg-[var(--warning)]/10 border border-[var(--warning)] rounded-lg">
                      <AlertCircle className="w-4 h-4 text-[var(--warning)] mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">Cancellation scheduled</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {onFreePlan && (
                <div className="text-sm text-[var(--muted-foreground)]">
                  <p>You're currently on the free plan with limited evaluations.</p>
                  <p className="mt-2">Upgrade to unlock more features and higher limits.</p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {onFreePlan ? (
          <Button
            onClick={() => router.push('/pricing')}
            className="w-full"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Upgrade Plan
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => router.push('/pricing')}
              className="w-full"
            >
              Change Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {subscription && !subscription.cancelAtPeriodEnd && (
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="w-full text-[var(--error)] hover:text-[var(--error)] hover:border-[var(--error)]"
              >
                {canceling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Billing Information */}
      {!onFreePlan && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Billing Information
            </h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-start">
              <CreditCard className="w-5 h-5 text-[var(--muted-foreground)] mr-3 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[var(--foreground)] mb-2">
                  Payment method and billing details are managed securely through Stripe.
                </p>
                <button
                  onClick={handleManageBilling}
                  disabled={loadingPortal}
                  className="text-sm font-medium text-[var(--primary)] hover:opacity-80 inline-flex items-center disabled:opacity-50"
                >
                  {loadingPortal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Opening billing portal...
                    </>
                  ) : (
                    <>
                      Manage payment method
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Help Text */}
      <div className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
        <p>Need help? Contact support at support@visaevaluation.com</p>
      </div>
    </div>
  );
}
