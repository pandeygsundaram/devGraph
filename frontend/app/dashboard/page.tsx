'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { activityApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import { Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Welcome, {user?.name}!</h1>
        <p className="mt-2 text-muted-foreground">
          Track your development activity and productivity
        </p>
      </div>

      {/* API Key Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your API Key</CardTitle>
          <CardDescription>
            Use this key to integrate Renard with your development tools
          </CardDescription>
        </CardHeader>

        <CardContent>
          {apiKey ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-4 bg-muted rounded-lg font-mono text-sm break-all border">
                  {apiKey}
                </div>
                <Button
                  onClick={copyApiKey}
                  variant="outline"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Quick Start</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use this API key in your integrations:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <strong>VS Code Extension:</strong>
                      <code className="text-xs bg-background px-2 py-1 rounded border">
                        Settings → Renard API Key
                      </code>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <strong>CLI:</strong>
                      <code className="text-xs bg-background px-2 py-1 rounded border">
                        export RENARD_API_KEY="{apiKey?.substring(0, 20)}..."
                      </code>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <strong>Browser Extension:</strong>
                      <code className="text-xs bg-background px-2 py-1 rounded border">
                        Extension Settings → Paste API Key
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No API key found. Please contact support.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Recent Activities</CardTitle>
            <Button
              onClick={loadActivities}
              variant="ghost"
              size="sm"
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-muted-foreground">Loading activities...</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="default">
                          {activity.activityType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">
                        {activity.content}
                      </p>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
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
              <h3 className="text-lg font-semibold mb-2">
                No activities yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start tracking your work by integrating Renard with your VS Code, terminal, or browser.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {activities.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Total Activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {activities.filter(a => a.activityType === 'code').length}
            </div>
            <p className="text-sm text-muted-foreground">
              Code Activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {activities.filter(a => !a.processed).length}
            </div>
            <p className="text-sm text-muted-foreground">
              Pending Processing
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
