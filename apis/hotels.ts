import client from './client';

export const hotelsApi = {
	getHotelsForCity: async (cityId: number) => {
		try {
			const response = await client.get('/hotels', { params: { cityId } });
			return response.data;
		} catch (error: any) {
			throw error;
		}
	},
	getHotelById: async (hotelId: number) => {
		try {
			const response = await client.get(`/hotels/${hotelId}`);
			return response.data;
		} catch (error: any) {
			throw error;
		}
	},
	getRoomType: async (hotelId: number, roomTypeId: number) => {
		try {
			const response = await client.get(`/hotels/${hotelId}/room-types/${roomTypeId}`);
			return response.data;
		} catch (error: any) {
			throw error;
		}
	},
	bookRoomType: async (hotelId: number, roomTypeId: number, payload: { checkInDate: string; checkOutDate: string; roomsBooked: number }, token?: string) => {
		try {
			const url = `/hotels/${hotelId}/room-types/${roomTypeId}/book`;
			console.log('booking url', url);
			console.log('booking payload', JSON.stringify(payload));
			const response = await client.post(url, {...payload,roomTypeId:Number(roomTypeId)}, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
			console.log('booking response status', response.status);
			console.log('booking response data', response.data);
			return response.data;
		} catch (error: any) {
			console.log('booking request failed');
			console.log('error message', error.message);
			if (error.response) {
				console.log('error response status', error.response.status);
				console.log('error response data', error.response.data);
			}
			throw error;
		}
	},
}; 