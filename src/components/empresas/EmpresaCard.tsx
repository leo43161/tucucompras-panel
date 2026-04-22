"use client"
import Link from 'next/link'
import { MapPin, Phone, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StorePlaceholder } from './StorePlaceholder'
import type { Empresa } from '@/types/domain'

export function EmpresaCard({ empresa }: { empresa: Empresa }) {
  return (
    <Link href={`/empresas/${empresa.id}/productos`}>
      <Card className="hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
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

          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-violet-600 transition-colors shrink-0" />
        </div>
      </Card>
    </Link>
  )
}