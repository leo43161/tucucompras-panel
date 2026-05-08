"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Building2, Plus, Search } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { listEmpresas, deleteEmpresa } from '@/services/empresas'
import { hasToken, getSession } from '@/services/auth'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { CreateEmpresaDialog } from '@/components/empresas/CreateEmpresaDialog'
import { EditEmpresaDialog } from '@/components/empresas/EditEmpresaDialog'
import { EmpresaCard } from '@/components/empresas/EmpresaCard'
import { Topbar } from '@/components/Topbar'
import { Button } from '@/components/ui/button'
import type { Empresa } from '@/types/domain'

export default function EmpresasPage() {
  useAuthGuard()
  const router = useRouter()
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [deleting, setDeleting] = useState<Empresa | null>(null)
  const [deletingPending, setDeletingPending] = useState(false)
  const [filtro, setFiltro] = useState('')
  const session = typeof window !== 'undefined' ? getSession() : null
  const isSuperAdmin = session?.rol_id === 1

  useEffect(() => {
    if (!hasToken()) {
      router.replace('/login')
      return
    }
    if (session?.rol_id === 2 && session.empresa_id) {
      router.replace(`/empresas/productos?id=${session.empresa_id}`)
    }
  }, [router, session?.rol_id, session?.empresa_id])

  const { data: empresas, isLoading, isError } = useQuery({
    queryKey: ['empresas'],
    queryFn: listEmpresas,
    enabled: hasToken() && isSuperAdmin,
  })

  const filtered = useMemo(() => {
    const list = empresas ?? []
    const q = filtro.trim().toLowerCase()
    if (!q) return list
    return list.filter((e) =>
      [e.nombre, e.cuit, e.whatsapp_contacto, e.direccion]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [empresas, filtro])

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
    <div className="min-h-dvh bg-background bg-app-grid">
      <Topbar
        right={isSuperAdmin ? <CreateEmpresaDialog /> : undefined}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Administración
            </p>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 mt-1">
              <Building2 className="h-7 w-7 text-primary" />
              Empresas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {(empresas?.length ?? 0)} empresa{empresas?.length === 1 ? '' : 's'} registrada{empresas?.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar empresa…"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {isError && (
          <EmptyState
            title="No pudimos cargar las empresas"
            desc="Reintentá en unos segundos. Si el problema persiste, contactá al soporte."
          />
        )}

        {!isLoading && (empresas?.length ?? 0) === 0 && (
          <EmptyState
            title="Aún no hay empresas"
            desc="Comenzá creando tu primera empresa para asociarle productos."
            action={isSuperAdmin && (
              <Button className="gradient-brand text-white font-semibold mt-2">
                <Plus className="h-4 w-4 mr-2" /> Cargar nueva empresa
              </Button>
            )}
          />
        )}

        {!isLoading && (empresas?.length ?? 0) > 0 && filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">
            No hay empresas que coincidan con “{filtro}”.
          </p>
        )}

        <div className="grid gap-3">
          {filtered.map((e) => (
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
              Se eliminará <strong>{deleting?.nombre}</strong> (soft delete).
              Los productos quedarán asociados pero la empresa dejará de aparecer en el listado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deletingPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EmptyState({
  title, desc, action,
}: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-border rounded-2xl bg-card/40 px-6 py-16 text-center">
      <div className="mx-auto h-12 w-12 rounded-full grid place-items-center bg-primary/10 text-primary mb-4">
        <Building2 className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{desc}</p>
      {action && <div className="mt-4 inline-flex">{action}</div>}
    </div>
  )
}
