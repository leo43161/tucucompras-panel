"use client"
import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CategoriaRef } from '@/types/batch'
import type { Categoria } from '@/services/categorias'

interface Props {
  value: CategoriaRef
  onChange: (ref: CategoriaRef) => void
  options: Categoria[]
}

export function CategoryCombobox({ value, onChange, options }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const handleSelect = (opt: Categoria) => {
    onChange({ id: opt.id, nombre: opt.nombre })
    setOpen(false)
    setQuery('')
  }

  const handleCreate = () => {
    if (!query.trim()) return
    onChange({ nombre: query.trim() })
    setOpen(false)
    setQuery('')
  }

  const isNew = query.trim() && !options.some(o => o.nombre.toLowerCase() === query.trim().toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", !value.nombre && "text-slate-400")}>
          {value.nombre || 'Seleccionar categoría...'}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder="Buscar o crear..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>
              {isNew ? (
                <button className="w-full text-left text-sm p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" onClick={handleCreate}>
                  Crear <strong>"{query}"</strong>
                </button>
              ) : 'Sin resultados'}
            </CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem key={opt.id} value={opt.nombre} onSelect={() => handleSelect(opt)}>
                  <Check className={cn("mr-2 h-4 w-4", value.id === opt.id ? "opacity-100" : "opacity-0")} />
                  {opt.nombre}
                </CommandItem>
              ))}
              {isNew && (
                <CommandItem onSelect={handleCreate} className="text-violet-600">
                  + Crear "{query}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}