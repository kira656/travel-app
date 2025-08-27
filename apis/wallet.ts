import client from './client';

export const walletApi = {
  getMyWallet: async (token?: string) => {
    const res = await client.get('/wallet/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
    return res.data;
  },
  getRequests: async (page = 1, limit = 20, token?: string) => {
    const res = await client.get('/wallet/requests', {
      params: { page, limit },
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    });
    return res.data;
  },
  postRequest: async (payload: { amount: string; note?: string }, token?: string) => {
    const res = await client.post('/wallet/requests', payload, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
    return res.data;
  },
  getTransactions: async (page = 1, limit = 20, token?: string) => {
    const res = await client.get('/wallet/transactions', {
      params: { page, limit },
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    });
    return res.data;
  },
}; 