import { api } from '../../lib/api'
import type { User } from '../../types/api'

export interface LoginResponse {
  token: string
  user: User
}

export function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/login', { email, password })
}

export async function fetchMe(): Promise<User> {
  const response = await api.get<{ data: User }>('/me')

  return response.data
}

export function logoutRequest(): Promise<void> {
  return api.post<void>('/logout')
}