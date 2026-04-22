"use client"
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ImageMultiUploader } from './ImageMultiUploader'
import { analyzeProducts } from '@/services/ia'
import type { ProductoDraft } from '@/types/batch'

interface Props {
  empresaId: number
  onDraftsReady: (drafts: ProductoDraft[]) => void
}

export function BatchUploader({ empresaId, onDraftsReady }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast.error('Subí al menos una imagen')
      return
    }
    setLoading(true)
    try {
      const drafts = await analyzeProducts({ empresaId, description, images: files })
      toast.success(`${drafts.length} productos detectados`)
      onDraftsReady(drafts)
    } catch (err: any) {
      toast.error('Error al analizar', {
        description: err?.response?.data?.message ?? err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 md:p-6 space-y-5">
      <div className="space-y-2">
        <Label>Fotos de los productos</Label>
        <ImageMultiUploader files={files} onChange={setFiles} disabled={loading} />
      </div>

      <div className="space-y-2">
        <Label>Indicaciones para la IA (opcional)</Label>
        <Textarea
          placeholder="Ej: Zapatillas deportivas, todas a $45000. Hay modelos de running y urbanos."
          className="h-24 resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-slate-500">
          Texto general que ayude a la IA (precios, tipo de productos, etc). Puede ir vacío.
        </p>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={loading || files.length === 0}
        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
        size="lg"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando {files.length} imagen{files.length === 1 ? '' : 'es'}...</>
        ) : (
          <><Sparkles className="mr-2 h-4 w-4" /> Analizar con IA</>
        )}
      </Button>
    </Card>
  )
}