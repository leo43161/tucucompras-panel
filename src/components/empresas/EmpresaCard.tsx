"use client"
import { useRouter } from 'next/navigation'
import { MapPin, Phone, ChevronRight, Pencil, Trash2, Globe } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StorePlaceholder } from './StorePlaceholder'
import type { Empresa } from '@/types/domain'

interface Props {
  empresa: Empresa
  onEdit: () => void
  onDelete: () => void
}

export function EmpresaCard({ empresa, onEdit, onDelete }: Props) {
  const router = useRouter()

  const stop = (e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation()
    fn()
  }

  return (
    <Card
      onClick={() => router.push(`/empresas/productos?id=${empresa.id}`)}
      className="group relative overflow-hidden cursor-pointer border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg p-0"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-primary transition-colors" />
      <div className="flex items-center gap-4 p-4">
        <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-border bg-muted">
          {empresa.logo_url ? (
            <img src={empresa.logo_url} alt={empresa.nombre} className="h-full w-full object-cover" />
          ) : (
            <StorePlaceholder className="h-full w-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{empresa.nombre}</h3>
            {!empresa.visible && (
              <Badge variant="outline" className="text-[10px] uppercase">Oculta</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
            {empresa.direccion && (
              <span className="flex items-center gap-1 truncate max-w-[260px]">
                <MapPin className="h-3 w-3 shrink-0" /> {empresa.direccion}
              </span>
            )}
            {empresa.whatsapp_contacto && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 shrink-0" /> {empresa.whatsapp_contacto}
              </span>
            )}
            {empresa.sitio_web && (
              <span className="flex items-center gap-1 truncate max-w-[200px]">
                <Globe className="h-3 w-3 shrink-0" /> {empresa.sitio_web}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => stop(e, onEdit)} title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => stop(e, onDelete)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-1" />
        </div>
      </div>
    </Card>
  )
}
