import axios from 'axios'
import client from './client'

export const popularApi = {
  async getPopular(type: 'city' | 'hotel' | 'country' | 'trip') {
    try {
      const res = await client.get(`/home/popular?type=${encodeURIComponent(type)}`)
      return res.data
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || 'Failed to fetch popular')
      }
      throw new Error('Network error — could not reach popular endpoint')
    }
  },
}

export default popularApi


