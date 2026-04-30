"use client"
import { useRouter } from 'next/navigation'
import { LogOut, User2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { getSession, logout } from '@/services/auth'

interface TopbarProps {
  right?: React.ReactNode
}

export function Topbar({ right }: TopbarProps) {
  const router = useRouter()
  const session = typeof window !== 'undefined' ? getSession() : null

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  const rolLabel =
    session?.rol_id === 1 ? 'Super-Admin' :
    session?.rol_id === 2 ? 'Admin de empresa' : ''

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 glass">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
        <Logo size="sm" />

        <div className="flex items-center gap-2">
          {right}

          {session?.email && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card/60">
              <span className="h-7 w-7 rounded-md grid place-items-center bg-primary/15 text-primary">
                <User2 className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-medium truncate max-w-[160px]">{session.email}</p>
                {rolLabel && <p className="text-[10px] text-muted-foreground">{rolLabel}</p>}
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
