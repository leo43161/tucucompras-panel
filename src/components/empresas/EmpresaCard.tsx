"use client"
import { useRouter } from 'next/navigation'
import { MapPin, Phone, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
      className="hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4 p-4">
        <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0 border">
          {empresa.logo_url ? (
            <img src={empresa.logo_url} alt={empresa.nombre} className="h-full w-full object-cover" />
          ) : (
            <StorePlaceholder className="h-full w-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{empresa.nombre}</h3>
          <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
            {empresa.direccion && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" /> {empresa.direccion}
              </span>
            )}
            {empresa.whatsapp_contacto && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 shrink-0" /> {empresa.whatsapp_contacto}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => stop(e, onEdit)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={(e) => stop(e, onDelete)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-violet-600 transition-colors" />
        </div>
      </div>
    </Card>
  )
}