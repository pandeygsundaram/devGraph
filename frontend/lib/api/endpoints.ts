import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  apiKey?: string;
  team?: {
    id: string;
    name: string;
  };
}

// Auth endpoints
export const authApi = {
  signup: async (data: SignupData) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get<{ user: User }>('/auth/profile');
    return response.data;
  },
};

// Activity endpoints
export const activityApi = {
  ingest: async (data: {
    activityType: string;
    content: string;
    metadata?: any;
  }, apiKey: string) => {
    const response = await apiClient.post('/activities/ingest', data, {
      headers: {
        'x-api-key': apiKey,
      },
    });
    return response.data;
  },

  batchIngest: async (activities: any[], apiKey: string) => {
    const response = await apiClient.post(
      '/activities/ingest/batch',
      { activities },
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    );
    return response.data;
  },

  getMyActivities: async (apiKey: string, params?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/activities/my-activities', {
      headers: {
        'x-api-key': apiKey,
      },
      params,
    });
    return response.data;
  },
};
