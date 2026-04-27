"use client"
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Package } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ProductoListItem } from './ProductoListItem'
import { EditProductoDialog } from './EditProductoDialog'
import { listProductos, deleteProducto, type ProductoLoaded } from '@/services/productos'

interface Props { empresaId: number }

export function ProductoList({ empresaId }: Props) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<ProductoLoaded | null>(null)
  const [deleting, setDeleting] = useState<ProductoLoaded | null>(null)
  const [deletingPending, setDeletingPending] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['productos', empresaId],
    queryFn: () => listProductos(empresaId),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['productos', empresaId] })

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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-slate-500" />
        <h2 className="font-semibold">Productos cargados ({data?.length ?? 0})</h2>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <p className="text-center text-sm text-slate-400 py-8">
          Esta empresa aún no tiene productos cargados.
        </p>
      )}

      <div className="space-y-2">
        {data?.map((p) => (
          <ProductoListItem
            key={p.id}
            producto={p}
            onEdit={() => setEditing(p)}
            onDelete={() => setDeleting(p)}
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
            <AlertDialogAction onClick={handleDelete} disabled={deletingPending} className="bg-red-600 hover:bg-red-700">
              {deletingPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}