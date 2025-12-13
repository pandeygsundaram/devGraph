import { create } from 'zustand';
import type { Country, VisaType } from '@/types';
import { visaApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';

interface VisaState {
  countries: Country[];
  selectedCountry: Country | null;
  selectedVisaType: VisaType | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCountries: () => Promise<void>;
  fetchCountryVisas: (countryCode: string) => Promise<void>;
  fetchVisaTypeDetails: (countryCode: string, visaCode: string) => Promise<void>;
  setSelectedCountry: (country: Country | null) => void;
  setSelectedVisaType: (visaType: VisaType | null) => void;
  clearError: () => void;
}

export const useVisaStore = create<VisaState>((set, get) => ({
  countries: [],
  selectedCountry: null,
  selectedVisaType: null,
  isLoading: false,
  error: null,

  fetchCountries: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await visaApi.getAllCountries();

      if (response.success) {
        set({ countries: response.data.countries });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch countries';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCountryVisas: async (countryCode: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await visaApi.getCountryVisas(countryCode);

      if (response.success) {
        set({ selectedCountry: response.data.country });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch visa types';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchVisaTypeDetails: async (countryCode: string, visaCode: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await visaApi.getVisaTypeDetails(countryCode, visaCode);

      if (response.success) {
        set({ selectedVisaType: response.data.visaType });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch visa details';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedCountry: (country) => set({ selectedCountry: country }),

  setSelectedVisaType: (visaType) => set({ selectedVisaType: visaType }),

  clearError: () => set({ error: null }),
}));
