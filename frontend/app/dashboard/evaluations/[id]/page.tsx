'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download, CheckCircle2, XCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from 'sonner';
import Link from 'next/link';

interface EvaluationResult {
  score: number;
  isMalicious: boolean;
  maliciousReason?: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  checkpoints: Array<{
    checkpoint: string;
    status: 'met' | 'partially_met' | 'not_met' | 'not_applicable';
    evidence?: string;
    feedback?: string;
    score?: number;
  }>;
  suggestions: string[];
}

interface Document {
  type: string;
  fileName: string;
  r2Key: string;
  uploadedAt: string;
  signedUrl?: string;
}

interface Evaluation {
  _id: string;
  userId: string;
  country: string;
  visaType: string;
  documents: Document[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  evaluationResult?: EvaluationResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

export default function EvaluationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const evaluationId = params.id as string;

  useEffect(() => {
    fetchEvaluation();
    // Poll for updates if status is pending or processing
    const interval = setInterval(() => {
      if (evaluation?.status === 'pending' || evaluation?.status === 'processing') {
        fetchEvaluation();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [evaluationId, evaluation?.status]);

  const fetchEvaluation = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/evaluations/${evaluationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setEvaluation(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch evaluation');
      }
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      toast.error('An error occurred while fetching the evaluation');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this evaluation?')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/evaluations/${evaluationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Evaluation deleted successfully');
        router.push('/dashboard/evaluations');
      } else {
        toast.error(data.message || 'Failed to delete evaluation');
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast.error('An error occurred while deleting the evaluation');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-[var(--warning)]', text: 'text-[var(--warning-foreground)]', icon: AlertCircle },
      processing: { bg: 'bg-[var(--info)]', text: 'text-[var(--info-foreground)]', icon: Loader2 },
      completed: { bg: 'bg-[var(--success)]', text: 'text-[var(--success-foreground)]', icon: CheckCircle2 },
      failed: { bg: 'bg-[var(--error)]', text: 'text-[var(--error-foreground)]', icon: XCircle },
    }[status] || { bg: 'bg-[var(--muted)]', text: 'text-[var(--muted-foreground)]', icon: AlertCircle };

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className={`w-4 h-4 mr-2 ${status === 'processing' ? 'animate-spin' : ''}`} />
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

  if (!evaluation) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted-foreground)]">Evaluation not found</p>
        <Link
          href="/dashboard/evaluations"
          className="text-[var(--primary)] hover:underline mt-4 inline-block"
        >
          Back to Evaluations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/evaluations"
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              {evaluation.country} - {evaluation.visaType}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Created {new Date(evaluation.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(evaluation.status)}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Processing Message */}
      {(evaluation.status === 'pending' || evaluation.status === 'processing') && (
        <div className="bg-[var(--info)] border border-[var(--border)] rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Loader2 className="w-6 h-6 text-[var(--info-foreground)] animate-spin flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[var(--info-foreground)] mb-1">
                {evaluation.status === 'pending' ? 'Evaluation Queued' : 'Processing Your Documents'}
              </h3>
              <p className="text-sm text-[var(--info-foreground)] opacity-90">
                {evaluation.status === 'pending'
                  ? 'Your evaluation is in the queue and will be processed shortly.'
                  : 'Our AI is analyzing your documents. This usually takes 1-2 minutes.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {evaluation.status === 'failed' && (
        <div className="bg-[var(--error)] border border-[var(--border)] rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <XCircle className="w-6 h-6 text-[var(--error-foreground)] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[var(--error-foreground)] mb-1">Evaluation Failed</h3>
              <p className="text-sm text-[var(--error-foreground)] opacity-90">
                {evaluation.error || 'An error occurred during evaluation. Please try again or contact support.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {evaluation.status === 'completed' && evaluation.evaluationResult && (
        <div className="space-y-6 mb-8">
          {/* Eligibility Score */}
          <div
            className="rounded-xl p-8 text-white"
            style={{
              backgroundColor: evaluation.evaluationResult.isMalicious
                ? 'var(--warning)'
                : evaluation.evaluationResult.score >= 75
                ? 'var(--success)'
                : evaluation.evaluationResult.score >= 60
                ? '#3b82f6' // blue
                : evaluation.evaluationResult.score >= 40
                ? 'var(--warning)'
                : 'var(--error)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="opacity-80 mb-2">Eligibility Score</p>
                <div className="flex items-baseline">
                  <span className="text-6xl font-bold">{evaluation.evaluationResult.score}</span>
                  <span className="text-2xl ml-2">/100</span>
                </div>
                <p className="mt-4 text-lg">
                  {evaluation.evaluationResult.isMalicious ? (
                    <span className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      {evaluation.evaluationResult.maliciousReason || 'Your application needs review'}
                    </span>
                  ) : evaluation.evaluationResult.score >= 75 ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Excellent - Strong application!
                    </span>
                  ) : evaluation.evaluationResult.score >= 60 ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Likely Eligible - Solid profile
                    </span>
                  ) : evaluation.evaluationResult.score >= 40 ? (
                    <span className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Moderate - Improvements recommended
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <XCircle className="w-5 h-5 mr-2" />
                      Low - Significant improvements needed
                    </span>
                  )}
                </p>
              </div>
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="opacity-20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - evaluation.evaluationResult.score / 100)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{evaluation.evaluationResult.score}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {evaluation.evaluationResult.strengths?.length > 0 && (
            <div className="bg-[var(--success)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold text-[var(--success-foreground)] mb-4 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {evaluation.evaluationResult.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start text-sm text-[var(--success-foreground)] opacity-90">
                    <span className="mr-2">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {evaluation.evaluationResult.weaknesses?.length > 0 && (
            <div className="bg-[var(--warning)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold text-[var(--warning-foreground)] mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {evaluation.evaluationResult.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start text-sm text-[var(--warning-foreground)] opacity-90">
                    <span className="mr-2">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Checkpoints */}
          {evaluation.evaluationResult.checkpoints?.length > 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Requirements Checklist
              </h3>
              <ul className="space-y-3">
                {evaluation.evaluationResult.checkpoints.map((checkpoint, index) => (
                  <li key={index} className="text-sm border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      {checkpoint.status === 'met' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      ) : checkpoint.status === 'partially_met' ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      ) : checkpoint.status === 'not_applicable' ? (
                        <AlertCircle className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-[var(--foreground)]">{checkpoint.checkpoint}</p>
                          {checkpoint.score !== undefined && (
                            <span className="text-xs px-2 py-1 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                              {checkpoint.score}/100
                            </span>
                          )}
                        </div>
                        {checkpoint.feedback && (
                          <p className="text-[var(--muted-foreground)] mt-1">{checkpoint.feedback}</p>
                        )}
                        {checkpoint.evidence && (
                          <p className="text-sm italic text-[var(--muted-foreground)] mt-2 pl-3 border-l-2 border-[var(--border)]">
                            "{checkpoint.evidence}"
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {evaluation.evaluationResult.suggestions?.length > 0 && (
            <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold text-[var(--secondary-foreground)] mb-4">
                Suggestions for Improvement
              </h3>
              <ul className="space-y-2">
                {evaluation.evaluationResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start text-sm text-[var(--secondary-foreground)] opacity-90">
                    <span className="mr-2">{index + 1}.</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {evaluation.evaluationResult.summary && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">
                Summary
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-line">
                {evaluation.evaluationResult.summary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Documents */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="font-semibold text-[var(--foreground)] mb-4">Uploaded Documents</h3>
        <div className="space-y-3">
          {evaluation.documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{doc.fileName}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {doc.signedUrl && (
                <a
                  href={doc.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 text-[var(--muted-foreground)]" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
