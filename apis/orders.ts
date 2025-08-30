import axios from 'axios'
import client from './client'

export const ordersApi = {
  async getOrders(token?: string): Promise<any[]> {
    try {
      const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      console.log('[ordersApi] getOrders', { hasToken: !!token })
      const res = await client.get('/orders', opts)
      return res.data
    } catch (err: any) {
      console.log('[ordersApi] getOrders error', err)
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || 'Failed to fetch orders')
      }
      throw new Error('Network error — could not reach orders endpoint')
    }
  },

  async cancelOrder(orderId: number, token?: string): Promise<any> {
    console.log('[ordersApi] cancelOrder called', { orderId, hasToken: !!token })
    try {
      const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      console.log('[ordersApi] POST', `/orders/${orderId}/cancel`, { hasToken: !!token })
      const res = await client.post(`/orders/${orderId}/cancel`, {}, opts)
      console.log('[ordersApi] response', res.status, res.data)
      return res.data
    } catch (err: any) {
      console.log('[ordersApi] cancel error', err)
      if (axios.isAxiosError(err)) {
        const serverMsg = err.response?.data?.message || err.response?.data
        throw new Error(serverMsg || 'Cancel order failed')
      }
      throw new Error('Network error — could not reach cancel endpoint')
    }
  },
}

export default ordersApi


