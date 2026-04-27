"use client"
import { Pencil, Trash2, Tag } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ProductoLoaded } from '@/services/productos'

interface Props {
  producto: ProductoLoaded
  onEdit: () => void
  onDelete: () => void
}

export function ProductoListItem({ producto, onEdit, onDelete }: Props) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL
  const imageSrc = producto.imagen_principal_url?.startsWith('http')
    ? producto.imagen_principal_url
    : `${apiBase}/${producto.imagen_principal_url}`

  const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(n)

  return (
    <Card className="flex gap-3 p-3 hover:shadow-md transition-shadow">
      <div className="h-20 w-20 shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
        {producto.imagen_principal_url ? (
          <img src={imageSrc} alt="" className="h-full w-full object-cover" />
        ) : <div className="h-full w-full" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold truncate">{producto.nombre}</h3>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm mt-0.5">
          {producto.es_oferta && producto.precio_oferta ? (
            <>
              <span className="font-bold text-violet-600">${fmt(producto.precio_oferta)}</span>
              <span className="line-through text-slate-400 text-xs">${fmt(producto.precio)}</span>
            </>
          ) : (
            <span className="font-bold">${fmt(producto.precio)}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mt-1.5">
          {producto.categoria?.nombre && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Tag className="h-2.5 w-2.5" />
              {producto.categoria.nombre}
            </Badge>
          )}
          {producto.sub_categorias.slice(0, 3).map((s) => (
            <Badge key={s.id} variant="outline" className="text-[10px]">{s.nombre}</Badge>
          ))}
          {producto.sub_categorias.length > 3 && (
            <Badge variant="outline" className="text-[10px]">+{producto.sub_categorias.length - 3}</Badge>
          )}
        </div>
      </div>
    </Card>
  )
}