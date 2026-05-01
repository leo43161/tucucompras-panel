"use client"
import { useState } from 'react'
import {
  Pencil, Trash2, Tag, EyeOff, ImageOff, MoreVertical, Eye,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { getEstado, type ProductoLoaded } from '@/services/productos'

interface Props {
  producto: ProductoLoaded
  onEdit: () => void
  onDelete: () => void
  onToggleVisible?: () => void
}

export function ProductoListItem({
  producto, onEdit, onDelete, onToggleVisible,
}: Props) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL
  const imageSrc = producto.imagen_principal_url?.startsWith('http')
    ? producto.imagen_principal_url
    : `${apiBase}/${producto.imagen_principal_url}`

  const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(n)
  const { visible } = getEstado(producto)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Card
      className={[
        'group flex gap-3 p-0 hover:border-primary/40 transition-colors',
        !visible && 'opacity-60',
      ].join(' ')}
    >
      <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted m-3 mr-0 relative">
        {producto.imagen_principal_url ? (
          <img src={imageSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
        {!visible && (
          <div className="absolute inset-0 bg-background/60 grid place-items-center">
            <EyeOff className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 py-3 pr-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{producto.nombre}</h3>
              {!visible && (
                <Badge variant="outline" className="text-[10px] uppercase gap-1">
                  <EyeOff className="h-2.5 w-2.5" /> Oculto
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm mt-1">
              {producto.es_oferta && producto.precio_oferta ? (
                <>
                  <span className="font-bold text-accent">${fmt(producto.precio_oferta)}</span>
                  <span className="line-through text-muted-foreground text-xs">${fmt(producto.precio)}</span>
                  <Badge className="bg-accent/15 text-accent border border-accent/30 hover:bg-accent/15 text-[10px]">
                    Oferta
                  </Badge>
                </>
              ) : (
                <span className="font-bold">${fmt(producto.precio)}</span>
              )}
            </div>
          </div>

          {/* Acciones rápidas + menú */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Más acciones">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-1">
                <MenuItem
                  icon={visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  onClick={() => { setMenuOpen(false); onToggleVisible?.() }}
                  disabled={!onToggleVisible}
                >
                  {visible ? 'Ocultar al público' : 'Mostrar al público'}
                </MenuItem>
                <div className="my-1 h-px bg-border" />
                <MenuItem
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => { setMenuOpen(false); onDelete() }}
                  destructive
                >
                  Eliminar producto
                </MenuItem>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {producto.categoria?.nombre && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Tag className="h-2.5 w-2.5" />
              {producto.categoria.nombre}
            </Badge>
          )}
          {producto.sub_categorias?.slice(0, 3).map((s) => (
            <Badge key={s.id} variant="outline" className="text-[10px]">{s.nombre}</Badge>
          ))}
          {(producto.sub_categorias?.length ?? 0) > 3 && (
            <Badge variant="outline" className="text-[10px]">+{producto.sub_categorias.length - 3}</Badge>
          )}
        </div>
      </div>
    </Card>
  )
}

function MenuItem({
  icon, onClick, children, destructive, disabled,
}: {
  icon: React.ReactNode
  onClick: () => void
  children: React.ReactNode
  destructive?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-left transition-colors',
        'disabled:opacity-50 disabled:pointer-events-none',
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'hover:bg-muted',
      ].join(' ')}
    >
      <span className="text-muted-foreground shrink-0">{icon}</span>
      {children}
    </button>
  )
}
