import client from './client';

export const tripBookingsApi = {
  bookTrip: async (tripId: number, seats: number) => {
    const res = await client.post(`/trips/${tripId}/book`, { seats });
    return res.data;
  },
};
