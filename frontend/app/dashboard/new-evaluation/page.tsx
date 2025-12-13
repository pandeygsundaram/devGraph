'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X, Loader2, AlertCircle, ChevronDown, Globe, Plane } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useVisaStore } from '@/lib/stores/visaStore';
import { toast } from 'sonner';
import { QuotaExceededModal } from '@/components/QuotaExceededModal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/DropdownMenu';

export default function NewEvaluationPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { countries, fetchCountries } = useVisaStore();

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<any>(null);
  const [loadingQuota, setLoadingQuota] = useState(true);

  const selectedCountryData = countries.find(c => c.code === selectedCountry);
  const visaTypes = selectedCountryData?.visaTypes || [];

  useEffect(() => {
    fetchCountries();
    fetchQuotaInfo();
  }, [fetchCountries]);

  const fetchQuotaInfo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setQuotaInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching quota:', error);
    } finally {
      setLoadingQuota(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    // Validate file types
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const validFiles = newFiles.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid file type. Only PDF, DOC, and DOCX are allowed.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCountry || !selectedVisaType) {
      toast.error('Please select country and visa type');
      return;
    }

    if (files.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('country', selectedCountry);
      formData.append('visaType', selectedVisaType);
      files.forEach(file => {
        formData.append('documents', file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evaluations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.status === 402) {
        // Quota exceeded
        setShowQuotaModal(true);
        if (data.data) {
          setQuotaInfo({
            plan: data.data.currentPlan,
            callsUsed: data.data.usage.used,
            callsLimit: data.data.usage.limit,
            callsRemaining: 0
          });
        }
        toast.error(data.message || 'Evaluation limit reached');
      } else if (data.success) {
        toast.success('Evaluation created successfully!');
        router.push(`/dashboard/evaluations/${data.data.evaluationId}`);
      } else {
        toast.error(data.message || 'Failed to create evaluation');
      }
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast.error('An error occurred while creating the evaluation');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Quota Display */}
      {!loadingQuota && quotaInfo && (
        <div className={`mb-6 p-4 rounded-lg border ${
          quotaInfo.callsRemaining === 0
            ? 'bg-[var(--error)]/10 border-[var(--error)]'
            : quotaInfo.callsRemaining <= 1
            ? 'bg-[var(--warning)]/10 border-[var(--warning)]'
            : 'bg-[var(--muted)] border-[var(--border)]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {quotaInfo.callsRemaining === 0 && (
                <AlertCircle className="w-5 h-5 text-[var(--error)]" />
              )}
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  {quotaInfo.plan?.name || 'Free'} Plan
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {quotaInfo.callsRemaining} of {quotaInfo.callsLimit} evaluations remaining
                </p>
              </div>
            </div>
            {quotaInfo.callsRemaining === 0 && (
              <button
                onClick={() => router.push('/pricing')}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                Upgrade Now
              </button>
            )}
          </div>
          {quotaInfo.callsLimit > 0 && (
            <div className="mt-3 w-full bg-[var(--background)] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  quotaInfo.callsRemaining === 0
                    ? 'bg-[var(--error)]'
                    : quotaInfo.callsRemaining <= 1
                    ? 'bg-[var(--warning)]'
                    : 'bg-[var(--success)]'
                }`}
                style={{ width: `${(quotaInfo.callsRemaining / quotaInfo.callsLimit) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          Get Your Free Visa Evaluation
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Upload your documents to discover the best visa options for your profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Country and Visa Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country Selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Country
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {selectedCountry ? (
                      <>
                        {selectedCountryData?.flag} {selectedCountryData?.name}
                      </>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">Select Country</span>
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full min-w-[300px] max-h-80 overflow-y-auto">
                {countries.map(country => (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => {
                      setSelectedCountry(country.code);
                      setSelectedVisaType(''); // Reset visa type when country changes
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {country.flag} {country.name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Visa Type Selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Visa Type
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={!selectedCountry}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    {selectedVisaType ? (
                      visaTypes.find(v => v.code === selectedVisaType)?.name
                    ) : (
                      <span className="text-[var(--muted-foreground)]">
                        {selectedCountry ? 'Select Visa Type' : 'Select a country first'}
                      </span>
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full min-w-[300px] max-h-80 overflow-y-auto">
                {visaTypes.map(visa => (
                  <DropdownMenuItem
                    key={visa.code}
                    onClick={() => setSelectedVisaType(visa.code)}
                  >
                    {visa.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* File Upload Zone */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Resume / Documents
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragging
                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                : 'border-[var(--border)] hover:border-[var(--primary)]/50'
            }`}
          >
            <input
              type="file"
              onChange={handleFileInput}
              multiple
              accept=".pdf,.doc,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-[var(--foreground)] font-medium mb-2">
                Drag and drop or{' '}
                <span className="text-purple-500 underline cursor-pointer">click to upload</span>
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                PDF, DOC, or DOCX (max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Uploaded Files ({files.length})
            </label>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-[var(--primary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {file.name}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-[var(--muted)] rounded transition-colors"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !selectedCountry || !selectedVisaType || files.length === 0}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Start Evaluation'
          )}
        </button>

        {/* Privacy Notice */}
        <p className="text-sm text-center text-[var(--muted-foreground)]">
          Your data is encrypted and securely stored. We never share your information.
        </p>
      </form>

      {/* Quota Exceeded Modal */}
      <QuotaExceededModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        currentPlan={quotaInfo?.plan}
        usage={{
          used: quotaInfo?.callsUsed || 0,
          limit: quotaInfo?.callsLimit || 0
        }}
      />
    </div>
  );
}
