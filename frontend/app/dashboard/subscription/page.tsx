'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/authStore';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  _id: string;
  name: string;
  tier: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  callLimit: number;
  features: string[];
}

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');
  const { token } = useAuthStore();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!planId) {
      router.push('/pricing');
      return;
    }
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/plans`);
      const data = await response.json();

      if (data.success) {
        const selectedPlan = data.data.find((p: Plan) => p._id === planId);
        if (selectedPlan) {
          setPlan(selectedPlan);
        } else {
          toast.error('Plan not found');
          router.push('/pricing');
        }
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast.error('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!plan) return;

    setProcessing(true);
    try {
      const successUrl = `${window.location.origin}/dashboard/subscription/success`;
      const cancelUrl = `${window.location.origin}/dashboard/subscription/cancel`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: plan._id,
          successUrl,
          cancelUrl
        })
      });

      const data = await response.json();

      if (data.success && data.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.url;
      } else {
        toast.error(data.message || 'Failed to create checkout session');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted-foreground)]">Plan not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          Subscribe to {plan.name}
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Complete your subscription to unlock more evaluations
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">{plan.name}</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-[var(--foreground)]">
                ${(plan.price / 100).toFixed(0)}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                per {plan.billingPeriod === 'monthly' ? 'month' : 'year'}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {/* Features */}
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-3">What's included:</h3>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-[var(--success)] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--foreground)]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing breakdown */}
            {plan.billingPeriod === 'yearly' && (
              <div className="bg-[var(--muted)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[var(--foreground)]">Monthly equivalent</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    ${((plan.price / 100) / 12).toFixed(2)}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--success)]">Annual savings</span>
                  <span className="font-semibold text-[var(--success)]">~17%</span>
                </div>
              </div>
            )}

            {/* Payment info */}
            <div className="border-t border-[var(--border)] pt-4">
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                You'll be redirected to Stripe's secure checkout page to complete your payment.
                Your subscription will begin immediately after payment confirmation.
              </p>

              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push('/pricing')}
                className="w-full mt-3"
                disabled={processing}
              >
                Back to Plans
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="text-center text-sm text-[var(--muted-foreground)]">
        <p>Secure payment powered by Stripe</p>
        <p className="mt-2">Cancel anytime from your account settings</p>
      </div>
    </div>
  );
}
