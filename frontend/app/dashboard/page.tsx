'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { activityApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, apiKey } = useAuthStore();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success('API key copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadActivities = async () => {
    if (!apiKey) return;

    try {
      setLoading(true);
      const data = await activityApi.getMyActivities(apiKey, { limit: 10 });
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [apiKey]);

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[var(--foreground)]">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Track your development activity and productivity
          </p>
        </div>

        {/* API Key Card */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              Your API Key
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Use this key to integrate DevTrack AI with your tools
            </p>
          </CardHeader>
          <CardBody>
            {apiKey ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <code className="flex-1 p-4 bg-[var(--muted)] rounded-lg text-sm font-mono break-all">
                    {apiKey}
                  </code>
                  <Button onClick={copyApiKey} variant="outline">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Quick Start
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Use this API key in your integrations:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong className="text-blue-900 dark:text-blue-100">VS Code Extension:</strong>
                      <code className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        Settings → DevTrack API Key
                      </code>
                    </div>
                    <div>
                      <strong className="text-blue-900 dark:text-blue-100">CLI:</strong>
                      <code className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        export DEVTRACK_API_KEY="{apiKey?.substring(0, 20)}..."
                      </code>
                    </div>
                    <div>
                      <strong className="text-blue-900 dark:text-blue-100">Browser Extension:</strong>
                      <code className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        Extension Settings → Paste API Key
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[var(--muted-foreground)]">
                  No API key found. Please contact support.
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                Recent Activities
              </h2>
              <Button onClick={loadActivities} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                Loading activities...
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 text-xs font-medium bg-[var(--primary)] text-white rounded">
                            {activity.activityType}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--foreground)]">
                          {activity.content}
                        </p>
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                            {activity.metadata.filepath && (
                              <span>📄 {activity.metadata.filepath}</span>
                            )}
                            {activity.metadata.duration && (
                              <span className="ml-3">⏱️ {Math.round(activity.metadata.duration / 60)}m</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  No activities yet
                </h3>
                <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
                  Start tracking your work by integrating DevTrack AI with your VS Code, terminal, or browser.
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardBody>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-[var(--primary)]">
                  {activities.length}
                </div>
                <div className="text-sm text-[var(--muted-foreground)] mt-1">
                  Total Activities
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-[var(--primary)]">
                  {activities.filter(a => a.activityType === 'code').length}
                </div>
                <div className="text-sm text-[var(--muted-foreground)] mt-1">
                  Code Activities
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-[var(--primary)]">
                  {activities.filter(a => !a.processed).length}
                </div>
                <div className="text-sm text-[var(--muted-foreground)] mt-1">
                  Pending Processing
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
