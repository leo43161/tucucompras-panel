"use client"
import { useRef } from 'react'
import { Trash2, DollarSign, Tag, Upload, X, ImageOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { CategoryCombobox } from './CategoryCombobox'
import { SubCategoryMultiInput } from './SubCategoryMultiInput'
import type { ProductoDraft } from '@/types/batch'
import type { Categoria, SubCategoria } from '@/services/categorias'

interface Props {
  draft: ProductoDraft
  index: number
  categorias: Categoria[]
  subCategorias: SubCategoria[]
  onChange: (draft: ProductoDraft) => void
  onRemove: () => void
  imageFile?: File | null
  onImageChange?: (file: File | null) => void
}

export function ProductDraftCard({ draft, index, categorias, subCategorias, onChange, onRemove, imageFile, onImageChange }: Props) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update = (patch: Partial<ProductoDraft>) => onChange({ ...draft, ...patch })

  const previewSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : draft.imagen_principal_url
      ? (draft.imagen_principal_url.startsWith('http')
        ? draft.imagen_principal_url
        : `${apiBase}/${draft.imagen_principal_url}`)
      : null

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    onImageChange?.(file)
  }

  const removeImage = () => {
    onImageChange?.(null)
    update({ imagen_principal_url: '' })
  }

  return (
    <Card className="overflow-hidden border-border bg-card p-0">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-52 shrink-0 relative bg-muted">
          {previewSrc ? (
            <div className="relative w-full h-52 md:h-full group">
              <img src={previewSrc} alt="" className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-semibold z-10">
                #{index + 1}
              </span>
              {draft.es_oferta && (
                <span className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded z-10">
                  Oferta
                </span>
              )}
              {onImageChange && (
                <>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 z-10 bg-black/70 text-white rounded-full p-1.5 hover:bg-destructive transition-colors"
                    title="Quitar imagen"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-x-2 bottom-2 z-10 bg-black/70 text-white text-xs rounded-md py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Cambiar imagen
                  </button>
                </>
              )}
            </div>
          ) : (
            <div
              onClick={() => onImageChange && fileInputRef.current?.click()}
              className={[
                'w-full h-52 md:h-full flex flex-col items-center justify-center gap-2 px-4 text-center',
                onImageChange ? 'cursor-pointer hover:bg-muted/80 transition-colors' : '',
              ].join(' ')}
            >
              <span className="h-10 w-10 rounded-full grid place-items-center bg-primary/15 text-primary border border-primary/20">
                {onImageChange ? <Upload className="h-5 w-5" /> : <ImageOff className="h-5 w-5" />}
              </span>
              {onImageChange && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground">Subí una imagen</p>
                  <p className="text-[10px] text-muted-foreground">opcional</p>
                </>
              )}
              <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-semibold">
                #{index + 1}
              </span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        <div className="flex-1 p-4 md:p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Nombre del producto *
              </Label>
              <Input
                value={draft.nombre}
                onChange={(e) => update({ nombre: e.target.value })}
                placeholder="Ej: Zapatillas urbanas"
                className="h-10"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 mt-6"
              onClick={onRemove}
              title="Quitar del lote"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Descripción</Label>
            <Textarea
              className="h-16 resize-none"
              value={draft.descripcion}
              onChange={(e) => update({ descripcion: e.target.value })}
              placeholder="Descripción breve y vendedora…"
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
                  className="pl-9 h-10 font-semibold"
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
                  className="pl-9 h-10"
                  placeholder="—"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Switch checked={draft.es_oferta} onCheckedChange={(v) => update({ es_oferta: v })} />
            <Label className="text-sm cursor-pointer">Mostrar como oferta</Label>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <Tag className="h-3 w-3 inline mr-1" /> Categoría *
              </Label>
              <CategoryCombobox
                value={draft.categoria}
                onChange={(cat) => update({ categoria: cat })}
                options={categorias}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Subcategorías</Label>
              <SubCategoryMultiInput
                value={draft.sub_categorias}
                onChange={(subs) => update({ sub_categorias: subs })}
                options={subCategorias}
                categoriaId={draft.categoria.id}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
