"use client"
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductDraftCard } from './ProductDraftCard'
import { listCategorias, listSubCategorias } from '@/services/categorias'
import { guardarProductosLote } from '@/services/productos'
import type { ProductoDraft } from '@/types/batch'

interface Props {
  empresaId: number
  drafts: ProductoDraft[]
  onDone: () => void
  onReset: () => void
}

export function BatchEditor({ empresaId, drafts: initialDrafts, onDone, onReset }: Props) {
  const [drafts, setDrafts] = useState<ProductoDraft[]>(initialDrafts)
  const [saving, setSaving] = useState(false)

  const catsQ = useQuery({ queryKey: ['categorias'], queryFn: listCategorias })
  const subsQ = useQuery({ queryKey: ['subcategorias'], queryFn: () => listSubCategorias() })

  const updateDraft = (localId: string, updated: ProductoDraft) => {
    setDrafts((ds) => ds.map((d) => (d._localId === localId ? updated : d)))
  }

  const removeDraft = (localId: string) => {
    setDrafts((ds) => ds.filter((d) => d._localId !== localId))
  }

  const handleSave = async () => {
    for (const d of drafts) {
      if (!d.nombre.trim()) return toast.error(`#${drafts.indexOf(d) + 1}: falta el nombre`)
      if (!d.categoria.nombre.trim()) return toast.error(`#${drafts.indexOf(d) + 1}: falta categoría`)
      if (d.precio < 0) return toast.error(`#${drafts.indexOf(d) + 1}: precio inválido`)
    }

    setSaving(true)
    try {
      const res = await guardarProductosLote({ empresaId, products: drafts })
      if (res.failed.length === 0) {
        toast.success(`${res.saved.length} productos guardados`)
        onDone()
      } else {
        toast.warning(`Guardados: ${res.saved.length}, fallaron: ${res.failed.length}`, {
          description: res.failed.map(f => `#${f.index + 1}: ${f.error}`).join(' | '),
        })
      }
    } catch (err: any) {
      toast.error('Error al guardar', { description: err?.response?.data?.message ?? err.message })
    } finally {
      setSaving(false)
    }
  }

  if (catsQ.isLoading || subsQ.isLoading) {
    return <div className="flex justify-center py-20 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-semibold">Auditoría de carga ({drafts.length})</p>
            <p className="text-xs text-slate-500">Revisá y confirmá los productos detectados</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={saving}>Cancelar</Button>
      </div>

      {drafts.map((d, i) => (
        <ProductDraftCard
          key={d._localId}
          draft={d}
          index={i}
          categorias={catsQ.data ?? []}
          subCategorias={subsQ.data ?? []}
          onChange={(updated) => updateDraft(d._localId, updated)}
          onRemove={() => removeDraft(d._localId)}
        />
      ))}

      {drafts.length === 0 && (
        <p className="text-center text-slate-400 py-10">No quedan productos en el lote.</p>
      )}

      <div className="sticky bottom-4 bg-white dark:bg-slate-900 border rounded-lg p-3 flex justify-end gap-2 shadow-lg">
        <Button variant="outline" onClick={onReset} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving || drafts.length === 0} className="min-w-[160px]">
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Confirmar todo</>}
        </Button>
      </div>
    </div>
  )
}