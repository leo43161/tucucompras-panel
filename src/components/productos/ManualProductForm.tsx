"use client"
import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save, Upload, X, DollarSign, Tag, ImageIcon, PencilLine } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { CategoryCombobox } from './CategoryCombobox'
import { SubCategoryMultiInput } from './SubCategoryMultiInput'
import { listCategorias, listSubCategorias } from '@/services/categorias'
import { guardarProductosLote, uploadProductImage } from '@/services/productos'
import { getSession } from '@/services/auth'
import { cn } from '@/lib/utils'
import type { ProductoDraft, CategoriaRef, SubCategoriaRef } from '@/types/batch'

interface Props {
  empresaId: number
  onCreated: () => void
  onCancel: () => void
}

const emptyState = (): ProductoDraft => ({
  imagen_principal_url: '',
  nombre: '',
  descripcion: '',
  precio: 0,
  precio_oferta: null,
  es_oferta: false,
  categoria: { nombre: '' },
  sub_categorias: [],
})

export function ManualProductForm({ empresaId, onCreated, onCancel }: Props) {
  const session = typeof window !== 'undefined' ? getSession() : null
  const effectiveEmpresaId =
    session?.rol_id === 2 && session.empresa_id ? session.empresa_id : empresaId

  const qc = useQueryClient()
  const [draft, setDraft] = useState<ProductoDraft>(emptyState())
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const apiBase = process.env.NEXT_PUBLIC_API_URL
  const catsQ = useQuery({ queryKey: ['categorias'], queryFn: listCategorias })
  const subsQ = useQuery({ queryKey: ['subcategorias'], queryFn: () => listSubCategorias() })

  const update = (patch: Partial<ProductoDraft>) => setDraft((d) => ({ ...d, ...patch }))

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se aceptan imágenes')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    update({ imagen_principal_url: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.nombre.trim()) return toast.error('Falta el nombre del producto')
    if (!draft.categoria.nombre.trim()) return toast.error('Falta la categoría')
    if (draft.precio < 0) return toast.error('Precio inválido')

    setSaving(true)
    try {
      // 1. Subir imagen si hay
      let imagenUrl = draft.imagen_principal_url
      if (imageFile) {
        toast.loading('Subiendo imagen…', { id: 'upload' })
        imagenUrl = await uploadProductImage(imageFile)
        toast.dismiss('upload')
      }

      // 2. Guardar producto vía endpoint de lote (con un solo producto)
      const productPayload: ProductoDraft = {
        ...draft,
        imagen_principal_url: imagenUrl,
      }
      const res = await guardarProductosLote({
        empresaId: effectiveEmpresaId,
        products: [productPayload],
      })

      if (res.failed.length > 0) {
        toast.error('No se pudo guardar', {
          description: res.failed.map(f => f.error).join(' · '),
        })
        return
      }

      toast.success('Producto creado correctamente')
      qc.invalidateQueries({ queryKey: ['productos', effectiveEmpresaId] })
      onCreated()
    } catch (err: any) {
      toast.error('Error al guardar', {
        description: err?.response?.data?.message ?? err.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const previewSrc = imagePreview ?? (draft.imagen_principal_url
    ? (draft.imagen_principal_url.startsWith('http')
      ? draft.imagen_principal_url
      : `${apiBase}/${draft.imagen_principal_url}`)
    : null)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-0 overflow-hidden border-border bg-card">
        {/* Header */}
        <div className="relative px-5 md:px-6 py-5 border-b border-border">
          <div className="absolute inset-0 gradient-brand opacity-[0.05]" />
          <div className="relative flex items-center gap-3">
            <span className="h-10 w-10 rounded-lg grid place-items-center bg-primary/15 text-primary border border-primary/20">
              <PencilLine className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Carga manual</h2>
              <p className="text-sm text-muted-foreground">
                Llená los datos del producto. Los campos con * son obligatorios.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-[260px_1fr] gap-5 p-5 md:p-6">
          {/* Imagen */}
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5 inline mr-1" /> Imagen principal
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {previewSrc ? (
              <div className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted group">
                <img src={previewSrc} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-destructive transition-colors"
                  title="Quitar imagen"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-x-2 bottom-2 bg-black/70 text-white text-xs rounded-md py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Cambiar imagen
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  'aspect-square rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 px-4 text-center',
                  'bg-muted/30 hover:bg-muted/50 transition-colors',
                  dragOver
                    ? 'border-primary bg-primary/10 ring-brand-soft'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className="h-10 w-10 rounded-full grid place-items-center bg-primary/15 text-primary border border-primary/20">
                  <Upload className="h-5 w-5" />
                </span>
                <p className="text-xs font-semibold">Subí una imagen</p>
                <p className="text-[10px] text-muted-foreground">o arrastrala acá</p>
              </div>
            )}
          </div>

          {/* Campos */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Nombre del producto *
              </Label>
              <Input
                value={draft.nombre}
                onChange={(e) => update({ nombre: e.target.value })}
                placeholder="Ej: Zapatillas urbanas"
                className="h-11"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Descripción
              </Label>
              <Textarea
                value={draft.descripcion}
                onChange={(e) => update({ descripcion: e.target.value })}
                placeholder="Descripción breve y vendedora…"
                className="h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Precio *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={draft.precio}
                    onChange={(e) => update({ precio: Number(e.target.value) })}
                    className="pl-9 h-11 font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Precio oferta</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={draft.precio_oferta ?? ''}
                    onChange={(e) =>
                      update({ precio_oferta: e.target.value ? Number(e.target.value) : null })
                    }
                    className="pl-9 h-11"
                    placeholder="—"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <Switch
                checked={draft.es_oferta}
                onCheckedChange={(v) => update({ es_oferta: v })}
              />
              <Label className="text-sm cursor-pointer">Mostrar como oferta</Label>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Tag className="h-3 w-3 inline mr-1" /> Categoría *
                </Label>
                <CategoryCombobox
                  value={draft.categoria}
                  onChange={(cat: CategoriaRef) => update({ categoria: cat })}
                  options={catsQ.data ?? []}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Subcategorías
                </Label>
                <SubCategoryMultiInput
                  value={draft.sub_categorias}
                  onChange={(subs: SubCategoriaRef[]) => update({ sub_categorias: subs })}
                  options={subsQ.data ?? []}
                  categoriaId={draft.categoria.id}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer sticky */}
      <div className="sticky bottom-4 z-20">
        <div className="rounded-xl border border-border bg-card/95 glass shadow-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {imageFile ? '1 imagen lista para subir.' : 'Sin imagen seleccionada (opcional).'}
          </p>
          <div className="flex gap-2 sm:ml-auto">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="min-w-[180px] gradient-brand text-white font-semibold"
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Guardar producto</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
