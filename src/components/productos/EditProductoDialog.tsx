"use client"
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ProductDraftCard } from './ProductDraftCard'
import { listCategorias, listSubCategorias } from '@/services/categorias'
import { editProducto, type ProductoLoaded } from '@/services/productos'
import type { ProductoDraft } from '@/types/batch'

interface Props {
  producto: ProductoLoaded | null
  onClose: () => void
  onSaved: () => void
}

const loadedToDraft = (p: ProductoLoaded): ProductoDraft => ({
  id: p.id,
  imagen_principal_url: p.imagen_principal_url,
  nombre: p.nombre,
  descripcion: p.descripcion,
  precio: p.precio,
  precio_oferta: p.precio_oferta,
  es_oferta: p.es_oferta,
  categoria: p.categoria,
  sub_categorias: p.sub_categorias,
})

export function EditProductoDialog({ producto, onClose, onSaved }: Props) {
  const [draft, setDraft] = useState<ProductoDraft | null>(null)
  const [saving, setSaving] = useState(false)

  const catsQ = useQuery({ queryKey: ['categorias'], queryFn: listCategorias })
  const subsQ = useQuery({ queryKey: ['subcategorias'], queryFn: () => listSubCategorias() })

  useEffect(() => {
    setDraft(producto ? loadedToDraft(producto) : null)
  }, [producto])

  const handleSave = async () => {
    if (!draft || !draft.id) return
    if (!draft.nombre.trim() || !draft.categoria.nombre.trim()) {
      toast.error('Faltan campos obligatorios')
      return
    }
    setSaving(true)
    try {
      await editProducto(draft)
      toast.success('Producto actualizado')
      onSaved()
    } catch (err: any) {
      toast.error('Error al guardar', { description: err?.response?.data?.message ?? err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!producto} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full md:min-w-3xl max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar producto #{producto?.id}</DialogTitle>
        </DialogHeader>

        {draft && catsQ.data && subsQ.data ? (
          <ProductDraftCard
            draft={draft}
            index={0}
            categorias={catsQ.data}
            subCategorias={subsQ.data}
            onChange={setDraft}
            onRemove={onClose}
          />
        ) : (
          <div className="flex justify-center py-10 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !draft}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Guardar</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}