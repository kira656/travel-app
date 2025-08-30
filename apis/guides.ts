import client from './client';

export const guidesApi = {
  getAvailableGuides: async (params: { cityId?: number; startDate?: string; endDate?: string; page?: number; limit?: number } = {}, token?: string) => {
    try {
      const query = new URLSearchParams()
      if (params.cityId) query.append('cityId', String(params.cityId))
      if (params.startDate) query.append('startDate', params.startDate)
      if (params.endDate) query.append('endDate', params.endDate)
      if (params.page) query.append('page', String(params.page))
      if (params.limit) query.append('limit', String(params.limit))
      const headers: any = {}
      if (token) headers.Authorization = `Bearer ${token}`
      const response = await client.get(`/guides/available?${query.toString()}`, Object.keys(headers).length ? { headers } : undefined)
      return response.data
    } catch (error: any) {
      throw error
    }
  },
}


