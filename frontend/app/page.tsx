'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import Link from 'next/link';
import { Code2, Activity, Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Renard</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Track Your Development
              <br />
              <span className="text-primary">Activity Effortlessly</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Renard automatically captures and summarizes your developer work across
              AI assistants, VS Code, CLI tools, and browsers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Tracking Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why Renard?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-muted hover:border-primary/50 transition-colors">
              <CardHeader>
                <Activity className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Automatic Tracking</CardTitle>
                <CardDescription>
                  Seamlessly capture your development activities across multiple platforms
                  without manual logging.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-muted hover:border-primary/50 transition-colors">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your data is encrypted and stored securely. Complete control over your
                  activity logs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-muted hover:border-primary/50 transition-colors">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Productivity Insights</CardTitle>
                <CardDescription>
                  Get detailed insights into your coding patterns and productivity trends
                  over time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Simple Integration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Sign Up',
                description: 'Create your account and get your unique API key instantly.',
              },
              {
                step: '02',
                title: 'Integrate',
                description: 'Connect Renard with your VS Code, terminal, and browser using the API key.',
              },
              {
                step: '03',
                title: 'Track & Analyze',
                description: 'View your development activity and insights in real-time on your dashboard.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary/20">{item.step}</div>
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-background">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Track Your Progress?
              </h2>
              <p className="text-xl text-muted-foreground">
                Start tracking your development activity today. No credit card required.
              </p>
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started Now
                  <Zap className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Renard</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your development activity effortlessly
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 Renard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
