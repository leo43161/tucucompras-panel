"use client"
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Loader2, Building2, Phone, Globe, MapPin, Hash, Image as ImageIcon, Save,
} from 'lucide-react'

const MapPicker = dynamic(
  () => import('./MapPicker').then((m) => ({ default: m.MapPicker })),
  { ssr: false, loading: () => <div className="h-64 w-full rounded-lg bg-muted animate-pulse" /> },
)
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { editEmpresa } from '@/services/empresas'
import { LogoUploader } from './LogoUploader'
import { FormSection, Field } from './FormBits'
import type { Empresa } from '@/types/domain'

interface Props {
  empresa: Empresa | null
  onClose: () => void
}

interface FormState {
  nombre: string
  cuit: string
  whatsapp_contacto: string
  sitio_web: string
  direccion: string
  logo_url: string
  banner_url: string
  latitud: number | null
  longitud: number | null
}

const emptyState: FormState = {
  nombre: '', cuit: '', whatsapp_contacto: '', sitio_web: '', direccion: '',
  logo_url: '', banner_url: '', latitud: null, longitud: null,
}

export function EditEmpresaDialog({ empresa, onClose }: Props) {
  const qc = useQueryClient()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [form, setForm] = useState<FormState>(emptyState)

  useEffect(() => {
    if (empresa) {
      setForm({
        nombre: empresa.nombre ?? '',
        cuit: empresa.cuit ?? '',
        whatsapp_contacto: empresa.whatsapp_contacto ?? '',
        sitio_web: empresa.sitio_web ?? '',
        direccion: empresa.direccion ?? '',
        logo_url: empresa.logo_url ?? '',
        banner_url: empresa.banner_url ?? '',
        latitud: empresa.latitud ?? null,
        longitud: empresa.longitud ?? null,
      })
      setShowAdvanced(empresa.latitud != null || empresa.longitud != null)
    }
  }, [empresa])

  const mutation = useMutation({
    mutationFn: () => editEmpresa({
      id: empresa!.id,
      nombre: form.nombre.trim(),
      cuit: form.cuit.trim() || null,
      whatsapp_contacto: form.whatsapp_contacto.trim(),
      sitio_web: form.sitio_web.trim() || null,
      direccion: form.direccion.trim() || null,
      logo_url: form.logo_url || null,
      banner_url: form.banner_url || null,
      latitud: form.latitud,
      longitud: form.longitud,
    }),
    onSuccess: () => {
      toast.success('Empresa actualizada')
      qc.invalidateQueries({ queryKey: ['empresas'] })
      qc.invalidateQueries({ queryKey: ['empresas', 'me'] })
      onClose()
    },
    onError: (err: any) => {
      toast.error('Error al actualizar', {
        description: err?.response?.data?.message ?? err.message,
      })
    },
  })

  const handle = <K extends keyof Pick<FormState, 'nombre' | 'cuit' | 'whatsapp_contacto' | 'sitio_web' | 'direccion' | 'logo_url' | 'banner_url'>>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.whatsapp_contacto.trim()) {
      toast.error('Completá los campos obligatorios')
      return
    }
    mutation.mutate()
  }

  return (
    <Dialog open={!!empresa} onOpenChange={(v) => { if (!v && !mutation.isPending) onClose() }}>
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
                <DialogTitle className="text-xl">Editar empresa</DialogTitle>
                <DialogDescription className="mt-0.5">
                  {empresa?.nombre} · ID #{empresa?.id}
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
          >
            <div className="grid md:grid-cols-[180px_1fr] gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
                  <ImageIcon className="h-3 w-3 inline mr-1" /> Logo
                </label>
                <LogoUploader
                  value={form.logo_url}
                  onChange={(url) => setForm((f) => ({ ...f, logo_url: url ?? '' }))}
                />
              </div>
              <div className="space-y-3">
                <Field
                  label="Nombre del comercio"
                  required
                  icon={<Building2 />}
                  value={form.nombre}
                  onChange={handle('nombre')}
                  autoFocus
                />
                <Field
                  label="CUIT"
                  icon={<Hash />}
                  value={form.cuit}
                  onChange={handle('cuit')}
                  placeholder="20-12345678-9"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
                <ImageIcon className="h-3 w-3 inline mr-1" /> Banner (opcional)
              </label>
              <LogoUploader
                value={form.banner_url}
                onChange={(url) => setForm((f) => ({ ...f, banner_url: url ?? '' }))}
                shape="wide"
                hint="Imagen de portada"
              />
            </div>
          </FormSection>

          {/* CONTACTO */}
          <FormSection
            icon={<Phone className="h-3.5 w-3.5" />}
            title="Contacto"
          >
            <div className="grid md:grid-cols-2 gap-3">
              <Field
                label="WhatsApp"
                required
                icon={<Phone />}
                value={form.whatsapp_contacto}
                onChange={handle('whatsapp_contacto')}
                placeholder="5493815550000"
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
          >
            <Field
              label="Dirección"
              icon={<MapPin />}
              value={form.direccion}
              onChange={handle('direccion')}
              placeholder="San Martín 123"
            />

            {!showAdvanced ? (
              <button
                type="button"
                onClick={() => setShowAdvanced(true)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                + Marcar ubicación en mapa
              </button>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
                <MapPicker
                  lat={form.latitud}
                  lng={form.longitud}
                  onChange={(lat, lng) => setForm((f) => ({ ...f, latitud: lat, longitud: lng }))}
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, latitud: null, longitud: null }))
                    setShowAdvanced(false)
                  }}
                  className="text-xs text-destructive hover:underline"
                >
                  Quitar coordenadas
                </button>
              </div>
            )}
          </FormSection>

          <DialogFooter className="pt-2 -mx-6 px-6 pb-6 -mb-5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Guardar cambios</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
