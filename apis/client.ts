// src/api/client.ts
import axios from 'axios'

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, // ← http(s)://<host>:<port>
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

// ↘︎ optional: add interceptors here (e.g. for 401 refresh)

export default client
