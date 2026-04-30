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
  localStorage.removeItem(TOKEN_KEY)
}

export function hasToken(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(TOKEN_KEY)
}

/**
 * Decodifica el JWT del localStorage y devuelve la sesión actual.
 * No valida la firma (eso lo hace el backend) — solo lee el payload
 * para que la UI pueda renderizar condicionalmente según el rol.
 */
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson) as { exp: number; data: any }
    if (!payload?.data) return null
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      logout()
      return null
    }
    return {
      user_id: Number(payload.data.user_id),
      rol_id: Number(payload.data.rol_id),
      empresa_id: payload.data.empresa_id != null ? Number(payload.data.empresa_id) : null,
      email: String(payload.data.email ?? ''),
      exp: Number(payload.exp ?? 0),
    }
  } catch {
    return null
  }
}

export function isSuperAdmin(): boolean {
  return getSession()?.rol_id === 1
}

export function isEmpresaAdmin(): boolean {
  return getSession()?.rol_id === 2
}
