"use client"
import { useRef, useState } from 'react'
import { Camera, X, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Props {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

export function ImageMultiUploader({ files, onChange, disabled }: Props) {
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const acceptFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter((f) => f.type.startsWith('image/'))
    if (arr.length === 0) return
    onChange([...files, ...arr])
  }

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    acceptFiles(e.target.files)
    e.target.value = ''
  }

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      acceptFiles(e.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-3">
      <Input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAdd} />
      <Input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAdd} />

      {/* Dropzone solo visible cuando no hay imágenes */}
      {files.length === 0 ? (
        <div
          onClick={() => !disabled && galleryRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'relative cursor-pointer rounded-xl border-2 border-dashed transition-all',
            'flex flex-col items-center justify-center gap-2 px-6 py-10 text-center',
            'bg-muted/30 hover:bg-muted/50',
            dragOver
              ? 'border-primary bg-primary/10 ring-brand-soft'
              : 'border-border hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="h-11 w-11 rounded-full grid place-items-center bg-primary/15 text-primary border border-primary/20">
            <Upload className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold">Arrastrá las fotos acá</p>
          <p className="text-xs text-muted-foreground">
            o hacé clic para seleccionar desde tu dispositivo · JPG, PNG, WEBP
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group"
            >
              <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                disabled={disabled}
                title="Quitar"
              >
                <X className="h-3 w-3" />
              </button>
              <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                #{i + 1}
              </span>
            </div>
          ))}

          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={disabled}
            className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 border-border transition-colors disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[10px] font-medium">Agregar</span>
          </button>
        </div>
      )}

      {/* Botones secundarios */}
      <div className="flex flex-wrap gap-2">
        {files.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => galleryRef.current?.click()}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Agregar más
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="md:hidden"
          onClick={() => cameraRef.current?.click()}
          disabled={disabled}
        >
          <Camera className="h-4 w-4 mr-1.5" /> Sacar foto
        </Button>
        {files.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive ml-auto"
            onClick={() => onChange([])}
            disabled={disabled}
          >
            Limpiar todo
          </Button>
        )}
      </div>
    </div>
  )
}
