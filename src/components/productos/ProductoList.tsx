"use client"
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Package, Search, Plus, Eye, EyeOff, Filter } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductoListItem } from './ProductoListItem'
import { EditProductoDialog } from './EditProductoDialog'
import {
  listProductos,
  deleteProducto,
  toggleEstadoProducto,
  getEstado,
  type ProductoLoaded,
} from '@/services/productos'

type Filter = 'todos' | 'visibles' | 'ocultos'

interface Props {
  empresaId: number
  ctaHref?: string
}

export function ProductoList({ empresaId, ctaHref }: Props) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<ProductoLoaded | null>(null)
  const [deleting, setDeleting] = useState<ProductoLoaded | null>(null)
  const [deletingPending, setDeletingPending] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filter>('todos')

  const { data, isLoading } = useQuery({
    queryKey: ['productos', empresaId],
    queryFn: () => listProductos(empresaId),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['productos', empresaId] })

  const productos = data ?? []

  const stats = useMemo(() => {
    const total = productos.length
    let visibles = 0
    let ocultos = 0
    productos.forEach((p) => {
      const { visible } = getEstado(p)
      if (visible) visibles++
      else ocultos++
    })
    return { total, visibles, ocultos }
  }, [productos])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return productos.filter((p) => {
      const { visible } = getEstado(p)
      if (filtro === 'visibles' && !visible) return false
      if (filtro === 'ocultos' && visible) return false
      if (!q) return true
      return [p.nombre, p.descripcion, p.categoria?.nombre]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [productos, busqueda, filtro])

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingPending(true)
    try {
      await deleteProducto(deleting.id)
      toast.success('Producto eliminado')
      setDeleting(null)
      invalidate()
    } catch (err: any) {
      toast.error('Error al eliminar', { description: err?.response?.data?.message ?? err.message })
    } finally {
      setDeletingPending(false)
    }
  }

  const handleToggleVisible = async (p: ProductoLoaded) => {
    const { visible } = getEstado(p)
    const nuevoValor: 0 | 1 = visible ? 0 : 1
    try {
      await toggleEstadoProducto(p.id, 'visible', nuevoValor)
      toast.success(nuevoValor === 1 ? 'Producto visible al público' : 'Producto oculto al público')
      invalidate()
    } catch (err: any) {
      toast.error('Error al actualizar', { description: err?.response?.data?.message ?? err.message })
    }
  }

  return (
    <div className="space-y-4">
      {/* Header con stats + buscador */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-lg grid place-items-center bg-primary/15 text-primary border border-primary/20">
            <Package className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-lg">Productos cargados</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span><strong className="text-foreground">{stats.total}</strong> total</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-primary" /> {stats.visibles} visibles</span>
              <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" /> {stats.ocultos} ocultos</span>
            </div>
          </div>
        </div>

        <div className="relative md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar producto…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Tabs de filtro */}
      <div className="inline-flex gap-1 rounded-lg bg-muted/50 border border-border p-1 text-xs font-medium">
        <FilterTab active={filtro === 'todos'} onClick={() => setFiltro('todos')}>
          <Filter className="h-3 w-3" /> Todos ({stats.total})
        </FilterTab>
        <FilterTab active={filtro === 'visibles'} onClick={() => setFiltro('visibles')}>
          <Eye className="h-3 w-3" /> Visibles ({stats.visibles})
        </FilterTab>
        <FilterTab active={filtro === 'ocultos'} onClick={() => setFiltro('ocultos')}>
          <EyeOff className="h-3 w-3" /> Ocultos ({stats.ocultos})
        </FilterTab>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {!isLoading && stats.total === 0 && (
        <div className="border border-dashed border-border rounded-2xl bg-card/40 px-6 py-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-full grid place-items-center bg-primary/10 text-primary mb-4">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg">Tu catálogo está vacío</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Empezá agregando productos manualmente o usá la IA para detectarlos desde fotos.
          </p>
          {ctaHref && (
            <Link href={ctaHref}>
              <Button className="mt-4 gap-2 gradient-brand text-white font-semibold">
                <Plus className="h-4 w-4" /> Agregar productos
              </Button>
            </Link>
          )}
        </div>
      )}

      {!isLoading && stats.total > 0 && filtrados.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          {busqueda
            ? <>No hay productos que coincidan con “{busqueda}”.</>
            : <>No hay productos en este filtro.</>
          }
        </p>
      )}

      <div className="space-y-2">
        {filtrados.map((p) => (
          <ProductoListItem
            key={p.id}
            producto={p}
            onEdit={() => setEditing(p)}
            onDelete={() => setDeleting(p)}
            onToggleVisible={() => handleToggleVisible(p)}
          />
        ))}
      </div>

      <EditProductoDialog
        producto={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); invalidate() }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deleting?.nombre}</strong>. Esta acción marcará el producto como inactivo.
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

function FilterTab({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors',
        active
          ? 'bg-card text-foreground shadow-sm border border-border'
          : 'text-muted-foreground hover:text-foreground',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
