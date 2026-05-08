import api from './api'

interface LoginResponse {
  status: string
  message: string
  token?: string
  rol_id?: number
  empresa_id?: number | null
}

export interface Session {
  user_id: number
  rol_id: number
  empresa_id: number | null
  email: string
  exp: number
}

const TOKEN_KEY = 'tc_token'

export async function login(email: string, password: string): Promise<Session> {
  const { data } = await api.post<LoginResponse>('/api/login', { email, password })
  if (parseInt(data.status as any) !== 200 || !data.token) {
    throw new Error(data.message || 'Credenciales inválidas')
  }
  localStorage.setItem(TOKEN_KEY, data.token)
  const session = getSession()
  if (!session) throw new Error('Token inválido')
  return session
}

export function logout() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

export function redirectToLogin() {
  if (typeof window === 'undefined') return
  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

export function getRawToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function decodePayload(token: string): { exp: number; data: any } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson)
    if (!payload?.data || typeof payload.exp !== 'number') return null
    return payload
  } catch {
    return null
  }
}

export function isTokenExpired(): boolean {
  const token = getRawToken()
  if (!token) return true
  const payload = decodePayload(token)
  if (!payload) return true
  return payload.exp * 1000 <= Date.now()
}

export function hasToken(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return false
  if (isTokenExpired()) {
    logout()
    return false
  }
  return true
}

export function enforceAuth(): boolean {
  if (typeof window === 'undefined') return false
  if (!hasToken()) {
    logout()
    redirectToLogin()
    return false
  }
  return true
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  const payload = decodePayload(token)
  if (!payload) {
    logout()
    return null
  }
  if (payload.exp * 1000 <= Date.now()) {
    logout()
    redirectToLogin()
    return null
  }
  return {
    user_id: Number(payload.data.user_id),
    rol_id: Number(payload.data.rol_id),
    empresa_id: payload.data.empresa_id != null ? Number(payload.data.empresa_id) : null,
    email: String(payload.data.email ?? ''),
    exp: Number(payload.exp ?? 0),
  }
}

export function isSuperAdmin(): boolean {
  return getSession()?.rol_id === 1
}

export function isEmpresaAdmin(): boolean {
  return getSession()?.rol_id === 2
}
