"use client"
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createEmpresa } from '@/services/empresas'
import type { CreateEmpresaInput } from '@/types/domain'

const emptyForm: CreateEmpresaInput = {
  nombre: '',
  cuit: '',
  whatsapp_contacto: '',
  sitio_web: '',
  direccion: '',
  email: '',
  nombre_completo: '',
}

export function CreateEmpresaDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CreateEmpresaInput>(emptyForm)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: createEmpresa,
    onSuccess: () => {
      toast.success('Empresa creada correctamente')
      qc.invalidateQueries({ queryKey: ['empresas'] })
      setForm(emptyForm)
      setOpen(false)
    },
    onError: (err: any) => {
      toast.error('Error al crear empresa', {
        description: err?.response?.data?.message ?? err.message,
      })
    },
  })

  const handleChange = (field: keyof CreateEmpresaInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre || !form.whatsapp_contacto || !form.email || !form.nombre_completo) {
      toast.error('Completá los campos obligatorios')
      return
    }
    mutation.mutate(form)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-brand text-white font-semibold">
          <Plus className="h-4 w-4" />
          Nueva empresa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <Field label="Nombre del comercio *">
            <Input value={form.nombre} onChange={handleChange('nombre')} autoFocus />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="CUIT">
              <Input value={form.cuit} onChange={handleChange('cuit')} placeholder="20-12345678-9" />
            </Field>
            <Field label="WhatsApp *">
              <Input value={form.whatsapp_contacto} onChange={handleChange('whatsapp_contacto')} placeholder="5493815550000" />
            </Field>
          </div>

          <Field label="Sitio web">
            <Input value={form.sitio_web} onChange={handleChange('sitio_web')} placeholder="https://..." />
          </Field>

          <Field label="Dirección">
            <Input value={form.direccion} onChange={handleChange('direccion')} />
          </Field>

          <div className="border-t border-border pt-4 space-y-4">
            <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
              Datos del usuario dueño
            </p>
            <Field label="Nombre completo *">
              <Input value={form.nombre_completo} onChange={handleChange('nombre_completo')} />
            </Field>
            <Field label="Email *">
              <Input type="email" value={form.email} onChange={handleChange('email')} />
            </Field>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="gradient-brand text-white font-semibold">
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando…</>
              ) : 'Crear empresa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}