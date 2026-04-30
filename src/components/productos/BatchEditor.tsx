"use client"
import { useState } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save, CheckCircle2, ListChecks, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductDraftCard } from './ProductDraftCard'
import { listCategorias, listSubCategorias } from '@/services/categorias'
import { guardarProductosLote } from '@/services/productos'
import { getSession } from '@/services/auth'
import type { ProductoDraft } from '@/types/batch'

interface Props {
  empresaId: number
  drafts: ProductoDraft[]
  onDone: () => void
  onReset: () => void
}

export function BatchEditor({ empresaId, drafts: initialDrafts, onDone, onReset }: Props) {
  const session = typeof window !== 'undefined' ? getSession() : null
  const effectiveEmpresaId =
    session?.rol_id === 2 && session.empresa_id ? session.empresa_id : empresaId

  const [drafts, setDrafts] = useState<ProductoDraft[]>(initialDrafts)
  const [saving, setSaving] = useState(false)

  const qc = useQueryClient()
  const catsQ = useQuery({ queryKey: ['categorias'], queryFn: listCategorias })
  const subsQ = useQuery({ queryKey: ['subcategorias'], queryFn: () => listSubCategorias() })

  const updateDraft = (localId: string | undefined, updated: ProductoDraft) => {
    setDrafts((ds) => ds.map((d) => (d._localId === localId ? updated : d)))
  }

  const removeDraft = (localId: string | undefined) => {
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
      const res = await guardarProductosLote({ empresaId: effectiveEmpresaId, products: drafts })
      if (res.failed.length === 0) {
        toast.success(`${res.saved.length} productos guardados`)
        qc.invalidateQueries({ queryKey: ['productos', effectiveEmpresaId] })
        onDone()
      } else {
        qc.invalidateQueries({ queryKey: ['productos', effectiveEmpresaId] })
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
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header del editor */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4">
        <div className="absolute inset-0 gradient-brand opacity-[0.05]" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-10 w-10 rounded-lg grid place-items-center bg-primary/15 text-primary border border-primary/20 shrink-0">
              <ListChecks className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold flex items-center gap-2">
                Auditoría de carga
                <span className="text-xs font-medium text-muted-foreground">({drafts.length})</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Revisá nombre, precio y categoría de cada producto antes de confirmar.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset} disabled={saving} className="gap-1.5">
            <X className="h-4 w-4" /> Cancelar
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
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
      </div>

      {drafts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
          No quedan productos en el lote.
        </div>
      )}

      {/* Sticky footer */}
      <div className="sticky bottom-4 z-20">
        <div className="rounded-xl border border-border bg-card/95 glass shadow-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              <span className="text-foreground font-semibold">{drafts.length}</span> producto{drafts.length === 1 ? '' : 's'} listo{drafts.length === 1 ? '' : 's'} para guardar
            </span>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <Button variant="outline" onClick={onReset} disabled={saving}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || drafts.length === 0}
              className="min-w-[180px] gradient-brand text-white font-semibold"
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Confirmar todo</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
