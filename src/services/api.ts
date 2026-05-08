import axios from 'axios'

const TOKEN_KEY = 'tc_token'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
})

function decodeExp(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload?.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

function forceLogin() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      const exp = decodeExp(token)
      if (exp && exp * 1000 <= Date.now()) {
        forceLogin()
        return Promise.reject(new axios.Cancel('Token expirado')) as any
      }
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => {
    if (res?.data && (res.data.status === 401 || res.data.status === '401')) {
      forceLogin()
    }
    return res
  },
  (error) => {
    const status = error?.response?.status ?? error?.response?.data?.status
    if (status === 401 || status === '401') {
      forceLogin()
    }
    return Promise.reject(error)
  }
)

export default api
