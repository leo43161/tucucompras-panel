"use client"
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Pencil, Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { hasToken, getSession } from '@/services/auth'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { listEmpresas } from '@/services/empresas'
import { ProductoList } from '@/components/productos/ProductoList'
import { EditEmpresaDialog } from '@/components/empresas/EditEmpresaDialog'
import { Topbar } from '@/components/Topbar'
import type { Empresa } from '@/types/domain'

function ProductosContent() {
  useAuthGuard()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)

  const session = useMemo(() => (typeof window !== 'undefined' ? getSession() : null), [])
  const isSuperAdmin = session?.rol_id === 1
  const isEmpresaAdmin = session?.rol_id === 2

  const queryId = searchParams.get('id')
  const empresaId =
    isEmpresaAdmin && session?.empresa_id
      ? session.empresa_id
      : queryId
        ? Number(queryId)
        : null

  useEffect(() => {
    if (!hasToken()) router.replace('/login')
  }, [router])

  useEffect(() => {
    if (!empresaId && !isEmpresaAdmin) router.replace('/empresas')
  }, [empresaId, isEmpresaAdmin, router])

  const { data: misEmpresas } = useQuery({
    queryKey: ['empresas', 'me'],
    queryFn: listEmpresas,
    enabled: isEmpresaAdmin,
  })

  const miEmpresa = useMemo<Empresa | null>(() => {
    if (!isEmpresaAdmin || !misEmpresas) return null
    const list = misEmpresas as any[]
    if (list.length === 0) return null
    const e = list[0]
    if (e.empresa_id !== undefined) {
      return {
        id: Number(e.empresa_id),
        nombre: e.empresa_nombre ?? '',
        cuit: e.cuit ?? null,
        whatsapp_contacto: e.whatsapp_contacto ?? '',
        sitio_web: e.sitio_web ?? null,
        logo_url: e.logo_url ?? null,
        banner_url: e.banner_url ?? null,
        direccion: e.direccion ?? null,
        latitud: e.latitud ?? null,
        longitud: e.longitud ?? null,
        visible: (e.empresa_visible ?? 1) as 0 | 1,
        activo: (e.empresa_activo ?? 1) as 0 | 1,
        fecha_creacion: e.empresa_fecha_creacion ?? '',
      }
    }
    return e as Empresa
  }, [isEmpresaAdmin, misEmpresas])

  if (!empresaId) return null

  const headerTitle = isEmpresaAdmin && miEmpresa ? miEmpresa.nombre : `Empresa #${empresaId}`
  const nuevoHref = `/empresas/productos/nuevo?id=${empresaId}`

  return (
    <div className="min-h-dvh bg-background bg-app-grid">
      <Topbar
        right={
          <div className="flex items-center gap-2">
            {isEmpresaAdmin && miEmpresa && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hidden md:inline-flex"
                onClick={() => setEditingEmpresa(miEmpresa)}
              >
                <Pencil className="h-4 w-4" /> Editar mi empresa
              </Button>
            )}
            <Link href={nuevoHref}>
              <Button size="sm" className="gap-2 gradient-brand text-white font-semibold">
                <Plus className="h-4 w-4" /> Agregar productos
              </Button>
            </Link>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {isSuperAdmin && (
          <Link href="/empresas" className="inline-flex">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Volver a empresas
            </Button>
          </Link>
        )}

        {/* Hero */}
        <header className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 mb-8">
          <div className="absolute inset-0 gradient-brand opacity-[0.06]" />
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-2">
                <Package className="h-3.5 w-3.5" />
                {isEmpresaAdmin ? 'Mi catálogo' : 'Catálogo'}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1 truncate">
                {headerTitle}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestioná tus productos: edita, activá u oculta los que ya tenés cargados.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {isEmpresaAdmin && miEmpresa && (
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden gap-2"
                  onClick={() => setEditingEmpresa(miEmpresa)}
                >
                  <Pencil className="h-4 w-4" /> Editar empresa
                </Button>
              )}
              <Link href={nuevoHref}>
                <Button className="gap-2 gradient-brand text-white font-semibold shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" /> Agregar productos
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <ProductoList
          empresaId={empresaId}
          ctaHref={nuevoHref}
        />
      </div>

      <EditEmpresaDialog
        empresa={editingEmpresa}
        onClose={() => setEditingEmpresa(null)}
      />
    </div>
  )
}

export default function EmpresaProductosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <ProductosContent />
    </Suspense>
  )
}
