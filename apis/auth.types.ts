// src/api/auth.types.ts
export interface User {
  id: string
  name: string
  username: string
  email: string
  phone: string | null
  providerId: string | null
  avatar: string | null
  role: 'user' | 'admin'
  createdAt: string
}

export interface Tokens {
  accessToken: string // ✅ camel-case like the backend
  refreshToken: string
}

export interface AuthPayload {
  user: User
  tokens: Tokens
}

export interface SignUpDto {
  name: string
  username: string
  email: string
  password: string
  /** local file URI (React Native) or File object (web) */
  avatar?: string | File
}

export interface LoginDto {
  emailOrUsername: string
  password: string
}
