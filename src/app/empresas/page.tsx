"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Building2, LogOut } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { listEmpresas, deleteEmpresa } from '@/services/empresas'
import { hasToken, logout } from '@/services/auth'
import { CreateEmpresaDialog } from '@/components/empresas/CreateEmpresaDialog'
import { EditEmpresaDialog } from '@/components/empresas/EditEmpresaDialog'
import { EmpresaCard } from '@/components/empresas/EmpresaCard'
import { Button } from '@/components/ui/button'
import type { Empresa } from '@/types/domain'

export default function EmpresasPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [deleting, setDeleting] = useState<Empresa | null>(null)
  const [deletingPending, setDeletingPending] = useState(false)

  useEffect(() => {
    if (!hasToken()) router.replace('/login')
  }, [router])

  const { data: empresas, isLoading, isError } = useQuery({
    queryKey: ['empresas'],
    queryFn: listEmpresas,
    enabled: hasToken(),
  })

  const sorted = empresas ?? []

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingPending(true)
    try {
      await deleteEmpresa(deleting.id)
      toast.success('Empresa eliminada')
      qc.invalidateQueries({ queryKey: ['empresas'] })
      setDeleting(null)
    } catch (err: any) {
      toast.error('Error al eliminar', { description: err?.response?.data?.message ?? err.message })
    } finally {
      setDeletingPending(false)
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
              <Building2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              Empresas
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {sorted.length} cargadas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateEmpresaDialog />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="h-4 w-4 dark:text-violet-50" />
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
            Error al cargar empresas.
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Todavía no hay empresas cargadas.</p>
          </div>
        )}

        <div className="space-y-3">
          {sorted.map((e) => (
            <EmpresaCard
              key={e.id}
              empresa={e}
              onEdit={() => setEditing(e)}
              onDelete={() => setDeleting(e)}
            />
          ))}
        </div>
      </div>

      <EditEmpresaDialog empresa={editing} onClose={() => setEditing(null)} />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deleting?.nombre}</strong> (soft delete). Los productos quedarán asociados pero la empresa dejará de aparecer en el listado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deletingPending} className="bg-red-600 hover:bg-red-700">
              {deletingPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}