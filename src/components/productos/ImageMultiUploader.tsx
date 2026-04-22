"use client"
import { useRef } from 'react'
import { Camera, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

export function ImageMultiUploader({ files, onChange, disabled }: Props) {
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)
    onChange([...files, ...newFiles])
    e.target.value = ''
  }

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <Input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAdd} />
      <Input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAdd} />

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {files.map((f, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-slate-100 dark:bg-slate-800 group">
            <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              #{i + 1}
            </span>
          </div>
        ))}

        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          disabled={disabled}
          className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-violet-600 hover:border-violet-400 dark:border-slate-700 transition-colors disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px]">Agregar</span>
        </button>
      </div>

      <div className="flex gap-2 md:hidden">
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => cameraRef.current?.click()} disabled={disabled}>
          <Camera className="h-4 w-4 mr-2" /> Sacar foto
        </Button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {files.length === 0 ? 'Subí una foto por cada producto.' : `${files.length} imagen${files.length === 1 ? '' : 'es'} lista${files.length === 1 ? '' : 's'}.`}
      </p>
    </div>
  )
}