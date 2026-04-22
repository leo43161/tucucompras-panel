import api from './api'

interface LoginResponse {
  status: string
  message: string
  token?: string
}

export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post<LoginResponse>('/api/login', { email, password })
  console.log(data)
  if (parseInt(data.status) !== 200 || !data.token) {
    throw new Error(data.message || 'Credenciales inválidas')
  }
  localStorage.setItem('tc_token', data.token)
  return data.token
}

export function logout() {
  localStorage.removeItem('tc_token')
}

export function hasToken(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('tc_token')
}