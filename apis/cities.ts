// src/apis/cities.ts
import type { City } from './cities.types';
import client from './client';
// import { mockCityDetails } from '@/utils/mockData'; // Assuming you have mock data

export const citiesApi = {
  getCityDetails: async (cityId: string): Promise<City> => {
    try {
      const response = await client.get(`/cities/public/${cityId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  getCityWithHotelsAttractions: async (cityId: string) => {
    try {
      const response = await client.get(`/cities/${cityId}/with-hotels-attractions`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};