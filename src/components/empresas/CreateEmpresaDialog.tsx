"use client"
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Loader2, Plus, Building2, Phone, Globe, MapPin, Hash, User2, Mail, Image as ImageIcon,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createEmpresa } from '@/services/empresas'
import { LogoUploader } from './LogoUploader'
import { FormSection, Field } from './FormBits'
import { CreatedEmpresaSuccess } from './CreatedEmpresaSuccess'
import type { CreateEmpresaInput } from '@/types/domain'

const emptyForm: CreateEmpresaInput = {
  nombre: '',
  cuit: '',
  whatsapp_contacto: '',
  sitio_web: '',
  direccion: '',
  email: '',
  nombre_completo: '',
  logo_url: '',
}

export function CreateEmpresaDialog() {
  const [open, setOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [form, setForm] = useState<CreateEmpresaInput>(emptyForm)
  const [success, setSuccess] = useState<{
    email: string; password: string; nombre: string
  } | null>(null)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: createEmpresa,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['empresas'] })
      // Mostramos modal con la password generada
      setSuccess({
        email: form.email,
        password: data.raw_generated_password,
        nombre: form.nombre,
      })
      setForm(emptyForm)
      setShowAdvanced(false)
      setOpen(false)
    },
    onError: (err: any) => {
      toast.error('Error al crear empresa', {
        description: err?.response?.data?.message ?? err.message,
      })
    },
  })

  const handle = <K extends keyof CreateEmpresaInput>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre || !form.whatsapp_contacto || !form.email || !form.nombre_completo) {
      toast.error('Completá los campos obligatorios')
      return
    }
    // Limpieza: vacios → undefined
    const payload: CreateEmpresaInput = {
      ...form,
      cuit: form.cuit || undefined,
      sitio_web: form.sitio_web || undefined,
      direccion: form.direccion || undefined,
      logo_url: form.logo_url || undefined,
    }
    mutation.mutate(payload)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!mutation.isPending) setOpen(v) }}>
        <DialogTrigger asChild>
          <Button className="gap-2 gradient-brand text-white font-semibold shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Nueva empresa
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 scrollbar-thin">
          {/* Hero header */}
          <div className="relative overflow-hidden border-b border-border px-6 py-5">
            <div className="absolute inset-0 gradient-brand opacity-[0.07]" />
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
            <DialogHeader className="relative">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-lg grid place-items-center gradient-brand text-white shadow-md">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <DialogTitle className="text-xl">Nueva empresa</DialogTitle>
                  <DialogDescription className="mt-0.5">
                    Registrá un comercio nuevo y creá su usuario administrador.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-7">
            {/* DATOS DEL COMERCIO */}
            <FormSection
              icon={<Building2 className="h-3.5 w-3.5" />}
              title="Datos del comercio"
              desc="Cómo se mostrará en el catálogo público."
            >
              <div className="grid md:grid-cols-[180px_1fr] gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
                    <ImageIcon className="h-3 w-3 inline mr-1" /> Logo
                  </label>
                  <LogoUploader
                    value={form.logo_url}
                    onChange={(url) => setForm((f) => ({ ...f, logo_url: url ?? '' }))}
                    hint="Subir logo"
                  />
                </div>
                <div className="space-y-3">
                  <Field
                    label="Nombre del comercio"
                    required
                    icon={<Building2 />}
                    value={form.nombre}
                    onChange={handle('nombre')}
                    placeholder="Ej: Calzados El Centro"
                    autoFocus
                  />
                  <Field
                    label="CUIT"
                    icon={<Hash />}
                    value={form.cuit}
                    onChange={handle('cuit')}
                    placeholder="20-12345678-9"
                    hint="Opcional, formato libre."
                  />
                </div>
              </div>
            </FormSection>

            {/* CONTACTO */}
            <FormSection
              icon={<Phone className="h-3.5 w-3.5" />}
              title="Contacto"
              desc="Por dónde te van a consultar los clientes."
            >
              <div className="grid md:grid-cols-2 gap-3">
                <Field
                  label="WhatsApp"
                  required
                  icon={<Phone />}
                  value={form.whatsapp_contacto}
                  onChange={handle('whatsapp_contacto')}
                  placeholder="5493815550000"
                  hint="Sin guiones, con código de país."
                />
                <Field
                  label="Sitio web"
                  icon={<Globe />}
                  value={form.sitio_web}
                  onChange={handle('sitio_web')}
                  placeholder="https://tutienda.com"
                />
              </div>
            </FormSection>

            {/* UBICACIÓN */}
            <FormSection
              icon={<MapPin className="h-3.5 w-3.5" />}
              title="Ubicación"
              desc="Dirección física del comercio."
            >
              <Field
                label="Dirección"
                icon={<MapPin />}
                value={form.direccion}
                onChange={handle('direccion')}
                placeholder="San Martín 123, San Miguel de Tucumán"
              />

              {!showAdvanced ? (
                <button
                  type="button"
                  onClick={() => setShowAdvanced(true)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  + Agregar coordenadas GPS (avanzado)
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-dashed border-border p-3">
                  <Field
                    label="Latitud"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={form.latitud ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, latitud: e.target.value ? Number(e.target.value) : undefined }))
                    }
                    placeholder="-26.8083"
                  />
                  <Field
                    label="Longitud"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={form.longitud ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, longitud: e.target.value ? Number(e.target.value) : undefined }))
                    }
                    placeholder="-65.2176"
                  />
                </div>
              )}
            </FormSection>

            {/* USUARIO ADMINISTRADOR */}
            <div className="border-t border-border pt-5">
              <FormSection
                icon={<User2 className="h-3.5 w-3.5" />}
                title="Usuario administrador"
                desc="Quién va a poder cargar productos para esta empresa. Le generaremos una contraseña automática."
              >
                <div className="grid md:grid-cols-2 gap-3">
                  <Field
                    label="Nombre completo"
                    required
                    icon={<User2 />}
                    value={form.nombre_completo}
                    onChange={handle('nombre_completo')}
                    placeholder="Juan Pérez"
                  />
                  <Field
                    label="Email"
                    required
                    type="email"
                    icon={<Mail />}
                    value={form.email}
                    onChange={handle('email')}
                    placeholder="juan@empresa.com"
                  />
                </div>
              </FormSection>
            </div>

            <DialogFooter className="pt-2 -mx-6 px-6 pb-6 -mb-5 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="gradient-brand text-white font-semibold min-w-[140px]"
              >
                {mutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando…</>
                ) : 'Crear empresa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {success && (
        <CreatedEmpresaSuccess
          open={!!success}
          onClose={() => setSuccess(null)}
          email={success.email}
          password={success.password}
          empresaNombre={success.nombre}
        />
      )}
    </>
  )
}
