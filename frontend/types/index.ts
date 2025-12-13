// User types
export interface User {
  id: string;
  name: string;
  email: string;
  provider?: 'credentials' | 'google';
  apiKeys?: ApiKey[];
  evaluations?: any[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApiKey {
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string | null;
  isActive: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Visa types
export interface Country {
  code: string;
  name: string;
  flag: string;
  visaTypes: VisaType[];
}

export interface VisaType {
  code: string;
  name: string;
  description: string;
  minSalary?: number | null;
  currency?: string;
  processingTime: string;
  validityPeriod: string;
  requiredDocumentTypes?: string[];
  requiredDocuments?: RequiredDocument[];
}

export interface RequiredDocument {
  type: string;
  displayName: string;
  required: boolean;
  description: string;
}

export interface VisaConfigResponse {
  success: boolean;
  data: {
    countries: Country[];
    totalCountries: number;
    totalVisaTypes: number;
  };
}

export interface CountryVisaResponse {
  success: boolean;
  data: {
    country: Country;
  };
}

export interface VisaTypeDetailResponse {
  success: boolean;
  data: {
    country: {
      code: string;
      name: string;
      flag: string;
    };
    visaType: VisaType;
  };
}

// API error types
export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Generate API Key types
export interface GenerateApiKeyRequest {
  name: string;
}

export interface GenerateApiKeyResponse {
  success: boolean;
  message: string;
  data: {
    apiKey: ApiKey;
  };
}

export interface ApiKeysResponse {
  success: boolean;
  data: {
    apiKeys: ApiKey[];
  };
}

// Subscription types
export interface Plan {
  _id: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  callLimit: number;
  modelAccess: { gpt4oMini: boolean; gpt4o: boolean };
  features: string[];
  stripePriceId?: string;
  stripeProductId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  callsUsed: number;
  callsRemaining: number;
}

export interface SubscriptionStatus {
  subscription: Subscription | null;
  plan: Plan;
  isActive: boolean;
  onFreePlan: boolean;
}

// Evaluation types
export interface EvaluationResult {
  score: number;
  isEligible: boolean;
  strengths: string[];
  weaknesses: string[];
  missingDocuments: string[];
  recommendations: string[];
}

export interface EvaluationDocument {
  originalName: string;
  cloudflareUrl: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Evaluation {
  _id: string;
  userId: string;
  country: string;
  visaType: string;
  documents: EvaluationDocument[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: EvaluationResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface UsageAnalytics {
  summary: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    successRate: string;
    averageResponseTime?: string;
  };
  charts: {
    callsByDate: Record<string, number>;
    callsByEndpoint?: Record<string, number>;
    callsByStatus: Record<string, number>;
  };
  recentCalls: ApiCall[];
}

export interface ApiCall {
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  success: boolean;
  responseTime: number;
  ipAddress?: string;
}
