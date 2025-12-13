'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, Check, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';

interface Plan {
  _id: string;
  name: string;
  tier: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  callLimit: number;
  features: string[];
  stripePriceId?: string;
  isActive: boolean;
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/plans`);
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => plan.billingPeriod === billingPeriod);

  const handleSelectPlan = (plan: Plan) => {
    if (!isAuthenticated) {
      router.push('/signup');
      return;
    }

    if (plan.tier === 'free') {
      // Free plan - just go to dashboard
      router.push('/dashboard');
    } else {
      // Paid plan - go to checkout
      router.push(`/dashboard/subscription?planId=${plan._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Globe className="h-8 w-8 text-[var(--primary)]" />
              <span className="ml-2 text-xl font-bold text-[var(--foreground)]">VisaEval</span>
            </Link>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 px-4 py-2 rounded-md text-sm font-semibold transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 px-4 py-2 rounded-md text-sm font-semibold transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--foreground)] mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-[var(--muted-foreground)] mb-12 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start with 5 free evaluations.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-[var(--card)] rounded-lg p-1 border border-[var(--border)]">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-[var(--success)] text-[var(--success-foreground)] px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {filteredPlans.map((plan) => {
                const isPopular = plan.tier === 'pro';
                const isFree = plan.tier === 'free';

                return (
                  <div
                    key={plan._id}
                    className={`relative bg-[var(--card)] rounded-2xl p-8 border-2 transition-all transform hover:scale-105 ${
                      isPopular
                        ? 'border-[var(--primary)] shadow-2xl'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-1 rounded-full text-sm font-semibold">
                          POPULAR
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-[var(--foreground)]">
                          ${(plan.price / 100).toFixed(0)}
                        </span>
                        {!isFree && (
                          <span className="text-[var(--muted-foreground)] ml-2">
                            /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        )}
                      </div>
                      {billingPeriod === 'yearly' && !isFree && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-2">
                          ${((plan.price / 100) / 12).toFixed(2)}/month billed annually
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="text-center py-3 bg-[var(--muted)] rounded-lg border border-[var(--border)]">
                        <span className="text-2xl font-bold text-[var(--primary)]">
                          {plan.callLimit.toLocaleString()}
                        </span>
                        <span className="text-[var(--muted-foreground)] ml-2">evaluations/month</span>
                      </div>

                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-[var(--success)] mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-[var(--muted-foreground)]">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                        isPopular
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
                          : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80'
                      }`}
                    >
                      {isFree ? 'Get Started' : 'Subscribe Now'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--muted)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--foreground)] text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                question: 'Can I change plans later?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time from your dashboard.'
              },
              {
                question: 'What happens when I run out of evaluations?',
                answer: 'Your usage will reset at the start of your next billing period. You can also upgrade to a higher plan for more evaluations.'
              },
              {
                question: 'Is my data secure?',
                answer: 'Absolutely. All documents are encrypted and stored securely. We never share your information with third parties.'
              },
              {
                question: 'Can I cancel anytime?',
                answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]"
              >
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{faq.question}</h3>
                <p className="text-[var(--muted-foreground)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--background)] border-t border-[var(--border)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Link href="/" className="flex items-center mb-4 md:mb-0">
              <Globe className="h-6 w-6 text-[var(--primary)]" />
              <span className="ml-2 text-lg font-bold text-[var(--foreground)]">VisaEval</span>
            </Link>
            <div className="flex items-center space-x-6 text-sm text-[var(--muted-foreground)]">
              <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            © 2025 VisaEval. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
