"use client"
import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { SubCategoriaRef } from '@/types/batch'
import type { SubCategoria } from '@/services/categorias'

interface Props {
  value: SubCategoriaRef[]
  onChange: (val: SubCategoriaRef[]) => void
  options: SubCategoria[]
  categoriaId?: number
}

export function SubCategoryMultiInput({ value, onChange, options, categoriaId }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = categoriaId
    ? options.filter(o => o.categoria_id === categoriaId)
    : options

  const handleAdd = (ref: SubCategoriaRef) => {
    if (value.some(v => v.nombre.toLowerCase() === ref.nombre.toLowerCase())) return
    onChange([...value, ref])
    setQuery('')
  }

  const handleRemove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  const isNew = query.trim() && !filtered.some(o => o.nombre.toLowerCase() === query.trim().toLowerCase())

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {value.map((v, i) => (
          <Badge key={i} variant="secondary" className="gap-1 pr-1">
            {v.nombre}
            <button onClick={() => handleRemove(i)} className="hover:bg-slate-300 dark:hover:bg-slate-700 rounded p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <Plus className="h-3 w-3" /> Agregar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-64">
            <Command>
              <CommandInput placeholder="Buscar o crear..." value={query} onValueChange={setQuery} />
              <CommandList>
                <CommandEmpty>
                  {isNew ? (
                    <button className="w-full text-left text-sm p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      onClick={() => { handleAdd({ nombre: query.trim() }); setOpen(false) }}>
                      Crear <strong>"{query}"</strong>
                    </button>
                  ) : 'Sin resultados'}
                </CommandEmpty>
                <CommandGroup>
                  {filtered.map((opt) => (
                    <CommandItem key={opt.id} value={opt.nombre}
                      onSelect={() => { handleAdd({ id: opt.id, nombre: opt.nombre }); setOpen(false) }}>
                      {opt.nombre}
                    </CommandItem>
                  ))}
                  {isNew && (
                    <CommandItem className="text-violet-600"
                      onSelect={() => { handleAdd({ nombre: query.trim() }); setOpen(false) }}>
                      + Crear "{query}"
                    </CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}