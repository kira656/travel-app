/* eslint-disable import/no-named-as-default-member */
// src/api/auth.ts
import axios from 'axios'
import type { AuthPayload, LoginDto, SignUpDto, Tokens } from './auth.types'
import client from './client'

function buildFormData(dto: SignUpDto): FormData {
  const fd = new FormData()
  fd.append('name', dto.name)
  fd.append('username', dto.username)
  fd.append('email', dto.email)
  fd.append('password', dto.password)

  if (dto.avatar) {
    // RN expects { uri, name, type }; web can pass File directly
    const filePart =
      typeof dto.avatar === 'string'
        ? ({
            uri: dto.avatar,
            name: dto.avatar.split('/').pop() ?? 'avatar.jpg',
            type: 'image/jpeg', // or detect from file extension
          } as any)
        : dto.avatar // web File object

    fd.append('avatar', filePart)
  }
  return fd
}

function normaliseError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const msg =
      error.response?.data?.message ?? error.response?.data ?? error.message
    return new Error(msg)
  }
  return new Error('Network error — could not reach server')
}

export const authApi = {
  /** POST /auth/register  – returns user + tokens */
  async signUp(dto: SignUpDto): Promise<AuthPayload> {
    try {
      const res = await client.post<AuthPayload>(
        '/auth/register',
        buildFormData(dto),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      console.log(res.data);
      return res.data
    } catch (err) {
      throw normaliseError(err)
    }
  },

  /** POST /auth/login  – returns user + tokens */
  async login(dto: LoginDto): Promise<AuthPayload> {
    try {
      const res = await client.post<AuthPayload>(
        '/auth/login',
        dto // JSON body — axios stringifies & sets header automatically :contentReference[oaicite:0]{index=0}
      )
      return res.data
    } catch (err) {
      throw normaliseError(err)
    }
  },

  async logout(accessToken: string): Promise<void> {
    try {
      await client.post(
        '/auth/logout',
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
    } catch (err) {
      // Propagate a clean error – caller decides what to do
      if (axios.isAxiosError(err)) {
        throw new Error(
          err.response?.data?.message || err.response?.data || 'Logout failed'
        )
      }
      throw new Error('Network error — could not reach logout endpoint')
    }
  },

  async refresh(refreshToken: string): Promise<Tokens> {
    try {
      const res = await client.post<{ tokens: Tokens }>('/auth/refresh', {
        refreshToken,
      })
      console.log('ress', res.data.tokens)
      return res.data.tokens
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(
          err.response?.data?.message || err.response?.data || 'Refresh failed'
        )
      }
      throw new Error('Network error — could not reach refresh endpoint')
    }
  },
}
