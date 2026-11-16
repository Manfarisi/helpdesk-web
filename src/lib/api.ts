import { getToken } from './token'

const BASE_URL = String(import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(
  /\/+$/,
  '',
)

export class ApiError extends Error {
  readonly status: number
  readonly errors: Record<string, string[]>

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue>
type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: Method
  body?: unknown
  query?: QueryParams
}

let unauthorizedHandler: (() => void) | null = null

/**
 * Dipanggil AuthProvider supaya token yang ditolak API (401) langsung mengakhiri sesi.
 */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

function buildUrl(path: string, query?: QueryParams): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue

    // Validasi boolean Laravel menerima 1/0, bukan "true"/"false".
    params.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
  }

  const queryString = params.toString()

  return `${BASE_URL}${path}${queryString === '' ? '' : `?${queryString}`}`
}

function toApiError(status: number, payload: unknown): ApiError {
  let message = 'Terjadi kesalahan. Coba lagi.'
  let errors: Record<string, string[]> = {}

  if (typeof payload === 'object' && payload !== null) {
    const body = payload as { message?: unknown; errors?: unknown }

    if (typeof body.message === 'string' && body.message !== '') {
      message = body.message
    }

    if (typeof body.errors === 'object' && body.errors !== null) {
      errors = body.errors as Record<string, string[]>
    }
  }

  return new ApiError(status, message, errors)
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query } = options
  const token = getToken()

  const headers: Record<string, string> = { Accept: 'application/json' }

  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token !== null) headers.Authorization = `Bearer ${token}`

  let response: Response

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Tidak bisa terhubung ke server. Pastikan API sudah berjalan.')
  }

  if (response.status === 204) return undefined as T

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    // Token ditolak: sesi berakhir. Login yang gagal bukan 401 (API membalas 422).
    if (response.status === 401 && token !== null) unauthorizedHandler?.()

    throw toApiError(response.status, payload)
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, query?: QueryParams) => apiRequest<T>(path, { query }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
}