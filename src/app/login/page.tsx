"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, BarChart3, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/Logo'
import { login } from '@/services/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const session = await login(email, password)
      toast.success('Bienvenido a TucuCompras')
      if (session.rol_id === 2 && session.empresa_id) {
        router.replace(`/empresas/productos?id=${session.empresa_id}`)
      } else {
        router.replace('/empresas')
      }
    } catch (err: any) {
      toast.error('No pudimos iniciarte sesión', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh w-full grid lg:grid-cols-2 bg-background bg-app-grid">
      {/* Hero side */}
      <aside className="hidden lg:flex relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 gradient-brand opacity-[0.08]" />
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="lg" />

          <div className="space-y-8 max-w-md">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                Cargá tu catálogo en{' '}
                <span className="gradient-text-brand">minutos</span>, no en horas.
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Subí fotos, dejá que la IA detecte cada producto y publicá tu vidriera online sin perder tiempo.
              </p>
            </div>

            <ul className="space-y-4">
              <Feature icon={<Sparkles className="h-4 w-4" />} title="Carga con IA" desc="Detección automática de nombre, precio y categoría desde la foto." />
              <Feature icon={<BarChart3 className="h-4 w-4" />} title="Métricas reales" desc="Conocé qué productos generan más clics y consultas." />
              <Feature icon={<ShieldCheck className="h-4 w-4" />} title="Seguridad por rol" desc="Cada empresa solo ve y administra sus propios productos." />
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TucuCompras · Tucumán, Argentina
          </p>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresá con tu cuenta para administrar tu empresa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={show ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gradient-brand text-white font-semibold hover:opacity-95 transition-opacity"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ingresando…</>
              ) : (
                <>Ingresar <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>

          <p className="mt-8 text-xs text-muted-foreground text-center">
            ¿Problemas para ingresar? Contactá al administrador del sistema.
          </p>
        </div>
      </main>
    </div>
  )
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 h-8 w-8 rounded-md grid place-items-center bg-primary/10 text-primary border border-primary/20">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </li>
  )
}
