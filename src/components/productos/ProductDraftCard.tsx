"use client"
import { Trash2 } from 'lucide-react'
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
}

export function ProductDraftCard({ draft, index, categorias, subCategorias, onChange, onRemove }: Props) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL
  const imageSrc = draft.imagen_principal_url.startsWith('http')
    ? draft.imagen_principal_url
    : `${apiBase}/${draft.imagen_principal_url}`

  const update = (patch: Partial<ProductoDraft>) => onChange({ ...draft, ...patch })

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 shrink-0 bg-slate-100 dark:bg-slate-800 relative">
          <img src={imageSrc} alt="" className="w-full h-48 md:h-full object-cover" />
          <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            #{index + 1}
          </span>
        </div>

        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Nombre *</Label>
              <Input value={draft.nombre} onChange={(e) => update({ nombre: e.target.value })} />
            </div>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 shrink-0 mt-5" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label className="text-xs">Descripción</Label>
            <Textarea className="h-16 resize-none" value={draft.descripcion} onChange={(e) => update({ descripcion: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Precio *</Label>
              <Input type="number" value={draft.precio} onChange={(e) => update({ precio: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Precio oferta</Label>
              <Input type="number" value={draft.precio_oferta ?? ''} onChange={(e) => update({ precio_oferta: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={draft.es_oferta} onCheckedChange={(v) => update({ es_oferta: v })} />
            <Label className="text-xs">Está en oferta</Label>
          </div>

          <div>
            <Label className="text-xs">Categoría *</Label>
            <CategoryCombobox value={draft.categoria} onChange={(cat) => update({ categoria: cat })} options={categorias} />
          </div>

          <div>
            <Label className="text-xs">Subcategorías</Label>
            <SubCategoryMultiInput
              value={draft.sub_categorias}
              onChange={(subs) => update({ sub_categorias: subs })}
              options={subCategorias}
              categoriaId={draft.categoria.id}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}