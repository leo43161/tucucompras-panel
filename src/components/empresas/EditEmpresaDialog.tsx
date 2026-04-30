"use client"
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { editEmpresa } from '@/services/empresas'
import type { Empresa } from '@/types/domain'

interface Props {
  empresa: Empresa | null
  onClose: () => void
}

export function EditEmpresaDialog({ empresa, onClose }: Props) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    nombre: '', cuit: '', whatsapp_contacto: '', sitio_web: '', direccion: '',
  })

  useEffect(() => {
    if (empresa) {
      setForm({
        nombre: empresa.nombre ?? '',
        cuit: empresa.cuit ?? '',
        whatsapp_contacto: empresa.whatsapp_contacto ?? '',
        sitio_web: empresa.sitio_web ?? '',
        direccion: empresa.direccion ?? '',
      })
    }
  }, [empresa])

  const mutation = useMutation({
    mutationFn: () => editEmpresa({ id: empresa!.id, ...form }),
    onSuccess: () => {
      toast.success('Empresa actualizada')
      qc.invalidateQueries({ queryKey: ['empresas'] })
      onClose()
    },
    onError: (err: any) => {
      toast.error('Error al actualizar', {
        description: err?.response?.data?.message ?? err.message,
      })
    },
  })

  const onChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre || !form.whatsapp_contacto) {
      toast.error('Completá los campos obligatorios')
      return
    }
    mutation.mutate()
  }

  return (
    <Dialog open={!!empresa} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar empresa #{empresa?.id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nombre *</Label>
            <Input value={form.nombre} onChange={onChange('nombre')} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>CUIT</Label>
              <Input value={form.cuit} onChange={onChange('cuit')} />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp *</Label>
              <Input value={form.whatsapp_contacto} onChange={onChange('whatsapp_contacto')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Sitio web</Label>
            <Input value={form.sitio_web} onChange={onChange('sitio_web')} />
          </div>
          <div className="space-y-1.5">
            <Label>Dirección</Label>
            <Input value={form.direccion} onChange={onChange('direccion')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending} className="gradient-brand text-white font-semibold">
              {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…</> : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}