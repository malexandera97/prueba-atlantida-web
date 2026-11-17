import type { ApiErrorBody, FieldError } from '../types/api'

const baseUrl: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldError[]

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? `Error HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = body?.errors ?? []
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  byField(): Record<string, string> {
    return Object.fromEntries(this.fieldErrors.map((e) => [e.field, e.message]))
  }
}

async function request<T>(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
  let response: Response
  try {
    response = await fetch(baseUrl + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, { message: `No se pudo conectar con el servidor (${baseUrl}). Verifique que el backend esté en ejecución.` })
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody | null)
  }
  return data as T
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown, headers?: Record<string, string>) => request<T>('POST', path, body, headers),
}
