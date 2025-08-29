import client from './client';

export const tripBookingsApi = {
  bookTrip: async (tripId: number, seats: number, token?: string) => {
    const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const res = await client.post(`/trips/${tripId}/book`, { seats }, opts);
    return res.data;
  },
};
