'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, Loader2, Search } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from 'sonner';

interface Evaluation {
  _id: string;
  country: string;
  visaType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  evaluationResult?: {
    score: number;
    isMalicious: boolean;
  };
  createdAt: string;
}

export default function EvaluationsPage() {
  const { token } = useAuthStore();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evaluations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setEvaluations(data.data.evaluations);
      } else {
        toast.error(data.message || 'Failed to fetch evaluations');
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      toast.error('An error occurred while fetching evaluations');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch =
      evaluation.country.toLowerCase().includes(search.toLowerCase()) ||
      evaluation.visaType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-[var(--warning)]', text: 'text-[var(--warning-foreground)]' },
      processing: { bg: 'bg-[var(--info)]', text: 'text-[var(--info-foreground)]' },
      completed: { bg: 'bg-[var(--success)]', text: 'text-[var(--success-foreground)]' },
      failed: { bg: 'bg-[var(--error)]', text: 'text-[var(--error-foreground)]' },
    }[status] || { bg: 'bg-[var(--muted)]', text: 'text-[var(--muted-foreground)]' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">My Evaluations</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            View and manage your visa evaluation history
          </p>
        </div>
        <Link
          href="/dashboard/new-evaluation"
          className="inline-flex items-center bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Evaluation
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by country or visa type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Evaluations List */}
      {filteredEvaluations.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <FileText className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            {search || statusFilter !== 'all' ? 'No evaluations found' : 'No evaluations yet'}
          </h3>
          <p className="text-[var(--muted-foreground)] mb-6">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first visa evaluation to get started'}
          </p>
          {!search && statusFilter === 'all' && (
            <Link
              href="/dashboard/new-evaluation"
              className="inline-flex items-center bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Evaluation
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvaluations.map((evaluation) => (
            <Link
              key={evaluation._id}
              href={`/dashboard/evaluations/${evaluation._id}`}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary)] transition-all transform hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-[var(--primary)]" />
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">
                      {evaluation.country} - {evaluation.visaType}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {getStatusBadge(evaluation.status)}
              </div>

              {evaluation.status === 'completed' && evaluation.evaluationResult && (
                <div className="flex items-center space-x-6 pt-4 border-t border-[var(--border)]">
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Eligibility Score</p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      {evaluation.evaluationResult.score}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Status</p>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: evaluation.evaluationResult.isMalicious
                          ? 'var(--warning)'
                          : evaluation.evaluationResult.score >= 75
                          ? 'var(--success)'
                          : evaluation.evaluationResult.score >= 60
                          ? '#3b82f6'
                          : evaluation.evaluationResult.score >= 40
                          ? 'var(--warning)'
                          : 'var(--error)'
                      }}
                    >
                      {evaluation.evaluationResult.isMalicious
                        ? 'Needs Review'
                        : evaluation.evaluationResult.score >= 75
                        ? 'Excellent'
                        : evaluation.evaluationResult.score >= 60
                        ? 'Likely Eligible'
                        : evaluation.evaluationResult.score >= 40
                        ? 'Moderate'
                        : 'Low'}
                    </p>
                  </div>
                </div>
              )}

              {evaluation.status === 'processing' && (
                <div
                  className="flex items-center space-x-2 pt-4 border-t border-[var(--border)] text-sm"
                  style={{ color: 'var(--info)' }}
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing your documents...</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
