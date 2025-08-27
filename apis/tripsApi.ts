// api/tripsApi.ts
import client from './client';

export const tripsApi = {
  getTripsForCity: async (cityId: number) => {
    try {
      const response = await client.get('/trips', { params: { cityId } });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getTripById: async (id: number) => {
    try {
      const response = await client.get(`/trips/${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
