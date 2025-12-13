import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, SignupData } from '@/lib/api/endpoints';
import { authApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  token: string | null;
  apiKey: string | null;
  teamId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setApiKey: (apiKey: string | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      apiKey: null,
      teamId: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => {
        if (token) {
          document.cookie = `auth_token=${token}; path=/; max-age=604800`;
        } else {
          document.cookie = 'auth_token=; path=/; max-age=0';
        }
        set({ token });
      },

      setApiKey: (apiKey) => set({ apiKey }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (credentials) => {
        try {
          set({ isLoading: true });
          const response = await authApi.login(credentials);

          const { user, token } = response;
          get().setToken(token);
          set({ user, isAuthenticated: true });
          toast.success('Login successful!');
        } catch (error: any) {
          const message = error.response?.data?.error || 'Login failed';
          toast.error(message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (data) => {
        try {
          set({ isLoading: true });
          const response = await authApi.signup(data);

          const { user, token, apiKey, team } = response;
          get().setToken(token);
          if (apiKey) get().setApiKey(apiKey);
          set({
            user,
            teamId: team?.id,
            isAuthenticated: true,
          });
          toast.success('Account created successfully!');
        } catch (error: any) {
          const message = error.response?.data?.error || 'Signup failed';
          toast.error(message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        get().setToken(null);
        get().setApiKey(null);
        set({ user: null, teamId: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },

      refreshProfile: async () => {
        try {
          const response = await authApi.getProfile();
          set({ user: response.user });
        } catch (error) {
          console.error('Failed to refresh profile:', error);
        }
      },

      initialize: async () => {
        const state = get();
        if (state.token && typeof document !== 'undefined') {
          document.cookie = `auth_token=${state.token}; path=/; max-age=604800`;

          try {
            await get().refreshProfile();
          } catch (error) {
            console.error('Failed to refresh profile on init:', error);
            get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        apiKey: state.apiKey,
        teamId: state.teamId,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && state?.user) {
          console.log('✅ Auth state rehydrated from localStorage');
          state.isAuthenticated = true;
        } else {
          console.log('❌ No auth state found in localStorage');
        }
      },
    }
  )
);
