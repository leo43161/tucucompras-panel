"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Building2, LogOut } from 'lucide-react'
import { listEmpresas } from '@/services/empresas'
import { hasToken, logout } from '@/services/auth'
import { CreateEmpresaDialog } from '@/components/empresas/CreateEmpresaDialog'
import { EmpresaCard } from '@/components/empresas/EmpresaCard'
import { Button } from '@/components/ui/button'

export default function EmpresasPage() {
  const router = useRouter()

  useEffect(() => {
    if (!hasToken()) router.replace('/login')
  }, [router])

  const { data: empresas, isLoading, isError } = useQuery({
    queryKey: ['empresas'],
    queryFn: listEmpresas,
    enabled: hasToken(),
  })

  const sorted = empresas ?? []  // ya viene DESC del backend

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-violet-600" />
              Empresas
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {sorted.length} cargadas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateEmpresaDialog />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-red-500 text-sm">
            Error al cargar empresas. Revisá token y que la API esté corriendo.
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Todavía no hay empresas cargadas.</p>
          </div>
        )}

        <div className="space-y-3">
          {sorted.map((e) => <EmpresaCard key={e.id} empresa={e} />)}
        </div>
      </div>
    </div>
  )
}