"use client"
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadProductImage } from '@/services/productos'
import { cn } from '@/lib/utils'

interface Props {
  value: string | null | undefined
  onChange: (url: string | null) => void
  /** Texto a mostrar en el placeholder */
  hint?: string
  className?: string
  /** Forma del placeholder: 'square' (logo) | 'wide' (banner) */
  shape?: 'square' | 'wide'
}

export function LogoUploader({
  value, onChange, hint = 'Logo de la empresa', className, shape = 'square',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const apiBase = process.env.NEXT_PUBLIC_API_URL

  const previewSrc = value
    ? value.startsWith('http') ? value : `${apiBase}/${value}`
    : null

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se aceptan imágenes')
      return
    }
    setUploading(true)
    try {
      const url = await uploadProductImage(file)
      onChange(url)
      toast.success('Logo subido')
    } catch (err: any) {
      toast.error('No se pudo subir', {
        description: err?.response?.data?.message ?? err.message,
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (uploading) return
    const f = e.dataTransfer.files?.[0]
    if (f) upload(f)
  }

  const aspect = shape === 'wide' ? 'aspect-[16/6]' : 'aspect-square'

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />

      {previewSrc ? (
        <div className={cn('relative rounded-xl overflow-hidden border border-border bg-muted group', aspect)}>
          <img src={previewSrc} alt="" className="h-full w-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-background/70">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={uploading}
            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-destructive transition-colors disabled:opacity-50"
            title="Quitar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-x-2 bottom-2 bg-black/70 text-white text-xs rounded-md py-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-1.5 px-4 text-center transition-colors',
            'bg-muted/30 hover:bg-muted/50',
            aspect,
            dragOver
              ? 'border-primary bg-primary/10 ring-brand-soft'
              : 'border-border hover:border-primary/50',
            uploading && 'opacity-50 cursor-wait'
          )}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <>
              <span className="h-9 w-9 rounded-full grid place-items-center bg-primary/15 text-primary border border-primary/20">
                <Upload className="h-4 w-4" />
              </span>
              <p className="text-xs font-semibold">{hint}</p>
              <p className="text-[10px] text-muted-foreground">arrastrá o hacé clic</p>
            </>
          )}
        </div>
      )}

      {previewSrc && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(null)}
          disabled={uploading}
          className="text-muted-foreground hover:text-destructive text-xs h-7 px-2"
        >
          <ImageIcon className="h-3 w-3 mr-1" /> Quitar imagen
        </Button>
      )}
    </div>
  )
}
