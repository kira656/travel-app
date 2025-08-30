import axios from 'axios'
import client from './client'

export const notificationsApi = {
  async getNotifications(token?: string) {
    try {
      const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      const res = await client.get('/notifications', opts)
      return res.data
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || 'Failed to fetch notifications')
      }
      throw new Error('Network error — could not reach notifications endpoint')
    }
  },
}

export default notificationsApi


