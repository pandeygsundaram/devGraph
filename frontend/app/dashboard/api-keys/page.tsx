'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from 'sonner';
import {
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Check,
  Calendar,
  Activity,
} from 'lucide-react';
import type { ApiKey } from '@/types';
import { formatDateTime, copyToClipboard } from '@/lib/utils';

const apiKeySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
});

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

export default function ApiKeysPage() {
  const { refreshProfile } = useAuthStore();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
  });

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getApiKeys();
      if (response.success) {
        setApiKeys(response.data.apiKeys);
      }
    } catch (error) {
      toast.error('Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const onSubmit = async (data: ApiKeyFormData) => {
    try {
      setIsCreating(true);
      const response = await authApi.generateApiKey(data);
      if (response.success) {
        toast.success('API key created successfully!');
        setShowCreateForm(false);
        reset();
        await fetchApiKeys();
        await refreshProfile();
      }
    } catch (error) {
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to deactivate this API key?')) {
      return;
    }

    try {
      const response = await authApi.deactivateApiKey(key);
      if (response.success) {
        toast.success('API key deactivated successfully');
        await fetchApiKeys();
        await refreshProfile();
      }
    } catch (error) {
      toast.error('Failed to deactivate API key');
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleCopy = async (key: string) => {
    try {
      await copyToClipboard(key);
      setCopiedKey(key);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  const maskKey = (key: string) => {
    if (visibleKeys.has(key)) {
      return key;
    }
    return `${key.substring(0, 8)}${'•'.repeat(24)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">API Keys</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Manage your API keys for programmatic access
          </p>
        </div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Key
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Create New API Key
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="API Key Name"
                placeholder="Production API"
                error={errors.name?.message}
                {...register('name')}
              />
              <Button type="submit" isLoading={isCreating}>
                Generate API Key
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {apiKeys.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
              No API Keys Yet
            </h3>
            <p className="text-[var(--muted-foreground)] mb-4">
              Create your first API key to start using the platform programmatically
            </p>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.key}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {apiKey.name}
                      </h3>
                      <span
                        className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          apiKey.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <code className="text-sm bg-[var(--muted)] px-3 py-1.5 rounded font-mono">
                        {maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.key)}
                      >
                        {visibleKeys.has(apiKey.key) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(apiKey.key)}
                      >
                        {copiedKey === apiKey.key ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-[var(--muted-foreground)]">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created: {formatDateTime(apiKey.createdAt)}
                      </div>
                      {apiKey.lastUsed && (
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 mr-1" />
                          Last used: {formatDateTime(apiKey.lastUsed)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    {apiKey.isActive && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(apiKey.key)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
