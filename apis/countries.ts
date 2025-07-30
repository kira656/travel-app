import { mockCountriesResponse } from '@/utils/mockData';
import client from './client';
import type { CountriesResponse, Country } from './countries.types';

export const countriesApi = {
  // Get all public countries
  getPublicCountries: async (): Promise<CountriesResponse> => {
    try {
      const response = await client.get('/countries/public');
      return response.data;
    } catch (error: any) {
      // Fallback to mock data during development
      console.warn('API not available, using mock data:', error.message);
      return mockCountriesResponse;
    }
  },

  // Get country by ID
  getCountryById: async (countryId: number): Promise<Country> => {
    try {
      console.log('countryId', countryId);
      const response = await client.get(`/countries/public/${countryId}`);
      console.log('response', response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch country');
    }
  },

  // Search countries (if backend supports it)
  searchCountries: async (query: string): Promise<CountriesResponse> => {
    try {
      const response = await client.get(`/countries/public?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search countries');
    }
  },
}; 