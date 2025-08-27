import client from './client';

export const attractionsApi = {
	getAttractionsForCity: async (cityId: number) => {
		try {
			const response = await client.get('/attractions', { params: { cityId } });
			return response.data;
		} catch (error: any) {
			throw error;
		}
	},
	getAttractionById: async (id: number) => {
		try {
			const response = await client.get(`/attractions/${id}`);
			return response.data;
		} catch (error: any) {
			throw error;
		}
	},
}; 