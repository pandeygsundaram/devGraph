'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from 'sonner';
import { Activity, TrendingUp, AlertCircle, Clock, CheckCircle2, XCircle, ChevronDown, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/DropdownMenu';

interface UsageSummary {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: string;
  averageResponseTime: string;
}

interface Charts {
  callsByDate: { [key: string]: number };
  callsByEndpoint: { [key: string]: number };
  callsByStatus: { [key: number]: number };
}

interface RecentCall {
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  success: boolean;
  responseTime?: number;
  ipAddress?: string;
}

interface UsageData {
  summary: UsageSummary;
  charts: Charts;
  recentCalls: RecentCall[];
}

interface QuotaInfo {
  plan: {
    name: string;
    tier: string;
    billingPeriod: string;
  };
  quota: {
    limit: number;
    used: number;
    remaining: number;
    percentage: number;
  };
  billingPeriod: {
    start: string;
    end: string;
    daysRemaining: number;
  };
  status: string;
}

export default function ApiUsagePage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    fetchUsageData();
    fetchQuotaInfo();
  }, [selectedPeriod]);

  const fetchUsageData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (selectedPeriod) {
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      console.log('📊 Fetching usage data:', { startDate, endDate, token: token?.substring(0, 10) + '...' });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/usage?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      console.log('📊 Usage data response:', data);
      console.log('📊 Charts data:', data.data?.charts);
      console.log('📊 Recent calls:', data.data?.recentCalls);

      if (data.success) {
        setUsageData(data.data);
        console.log('✅ Usage data set:', data.data);
        console.log('✅ callsByDate:', Object.keys(data.data?.charts?.callsByDate || {}).length);
        console.log('✅ callsByEndpoint:', Object.keys(data.data?.charts?.callsByEndpoint || {}).length);
      } else {
        console.error('❌ Failed to fetch usage data:', data);
        toast.error(data.message || 'Failed to fetch usage data');
      }
    } catch (error) {
      console.error('❌ Error fetching usage data:', error);
      toast.error('An error occurred while fetching usage data');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotaInfo = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/summary`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setQuotaInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching quota info:', error);
    }
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <span className="px-2 py-1 text-xs rounded-full bg-[var(--success)] text-[var(--success-foreground)]">{statusCode}</span>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <span className="px-2 py-1 text-xs rounded-full bg-[var(--warning)] text-[var(--warning-foreground)]">{statusCode}</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-[var(--error)] text-[var(--error-foreground)]">{statusCode}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">API Usage</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Monitor your API usage and performance</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <Calendar className="w-4 h-4" />
              <span>
                {selectedPeriod === '24h' ? 'Last 24 hours' :
                 selectedPeriod === '7d' ? 'Last 7 days' :
                 'Last 30 days'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedPeriod('24h')}>
              Last 24 hours
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPeriod('7d')}>
              Last 7 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPeriod('30d')}>
              Last 30 days
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quota Info Card */}
      {quotaInfo && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{quotaInfo.plan.name} Plan</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {quotaInfo.billingPeriod.daysRemaining} days remaining in billing period
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {quotaInfo.quota.remaining}/{quotaInfo.quota.limit}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">API calls remaining</p>
            </div>
          </div>
          <div className="w-full bg-[var(--muted)] rounded-full h-3">
            <div
              className="bg-[var(--primary)] h-3 rounded-full transition-all"
              style={{ width: `${quotaInfo.quota.percentage}%` }}
            />
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            {quotaInfo.quota.percentage}% used
          </p>
        </div>
      )}

      {/* Stats Grid */}
      {usageData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-[var(--primary)]" />
              <TrendingUp className="w-5 h-5 text-[var(--success)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)]">{usageData.summary.totalCalls}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Total API Calls</p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)]">{usageData.summary.successfulCalls}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Successful Calls</p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-[var(--error)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)]">{usageData.summary.failedCalls}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Failed Calls</p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-[var(--info)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)]">{usageData.summary.averageResponseTime}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Avg Response Time</p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {usageData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calls by Date */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Calls Over Time</h3>
            <div className="space-y-2">
              {Object.keys(usageData.charts.callsByDate).length > 0 ? (
                Object.entries(usageData.charts.callsByDate).slice(0, 10).map(([date, count]) => (
                  <div key={date} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">{new Date(date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-[var(--muted)] rounded-full h-2">
                        <div
                          className="bg-[var(--primary)] h-2 rounded-full"
                          style={{ width: `${(count / Math.max(...Object.values(usageData.charts.callsByDate))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)] w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-8">No data available for this period</p>
              )}
            </div>
          </div>

          {/* Calls by Endpoint */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Top Endpoints</h3>
            <div className="space-y-2">
              {Object.keys(usageData.charts.callsByEndpoint).length > 0 ? (
                Object.entries(usageData.charts.callsByEndpoint).slice(0, 10).map(([endpoint, count]) => (
                  <div key={endpoint} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)] truncate max-w-[200px]">{endpoint}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-[var(--muted)] rounded-full h-2">
                        <div
                          className="bg-[var(--secondary)] h-2 rounded-full"
                          style={{ width: `${(count / Math.max(...Object.values(usageData.charts.callsByEndpoint))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)] w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-8">No data available for this period</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Calls Table */}
      {usageData && usageData.recentCalls.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recent API Calls</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground)]">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground)]">Endpoint</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground)]">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground)]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--foreground)]">Response Time</th>
                </tr>
              </thead>
              <tbody>
                {usageData.recentCalls.map((call, index) => (
                  <tr key={index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 px-4 text-sm text-[var(--muted-foreground)]">
                      {new Date(call.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--foreground)] font-mono truncate max-w-[200px]">
                      {call.endpoint}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-2 py-1 rounded bg-[var(--muted)] text-[var(--muted-foreground)] text-xs">
                        {call.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {getStatusBadge(call.statusCode)}
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--muted-foreground)]">
                      {call.responseTime ? `${call.responseTime}ms` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
