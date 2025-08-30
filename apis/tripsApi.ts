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
  
  // Calculate trip pricing for a custom trip
  calculateCustomTrip: async (payload: any, token?: string) => {
    try {
      const headers: any = {}
      if (token) headers.Authorization = `Bearer ${token}`
      const response = await client.post('/trips/calculate', payload, { headers })
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  // Create a custom trip (and optionally book it).
  createCustomTrip: async (seats: number, trip: any, token?: string) => {
    try {
      const headers: any = {}
      if (token) headers.Authorization = `Bearer ${token}`
      const payload = { seats, trip }
      const response = await client.post('/trips/custom', payload, { headers })
      return response.data
    } catch (error: any) {
      throw error
    }
  },

};
    