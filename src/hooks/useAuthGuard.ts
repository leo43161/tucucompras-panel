"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasToken, isTokenExpired, logout } from '@/services/auth'

export function useAuthGuard() {
  const router = useRouter()

  useEffect(() => {
    const check = () => {
      if (!hasToken() || isTokenExpired()) {
        logout()
        router.replace('/login')
        return false
      }
      return true
    }

    if (!check()) return

    const interval = window.setInterval(check, 30_000)
    const onFocus = () => check()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') check()
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'tc_token') check()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('storage', onStorage)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('storage', onStorage)
    }
  }, [router])
}
