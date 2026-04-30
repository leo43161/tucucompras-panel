"use client"
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Sparkles, ImageIcon, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageMultiUploader } from './ImageMultiUploader'
import { analyzeProducts } from '@/services/ia'
import { getSession } from '@/services/auth'
import type { ProductoDraft } from '@/types/batch'

interface Props {
  empresaId: number
  onDraftsReady: (drafts: ProductoDraft[]) => void
}

export function BatchUploader({ empresaId, onDraftsReady }: Props) {
  const session = typeof window !== 'undefined' ? getSession() : null
  const effectiveEmpresaId =
    session?.rol_id === 2 && session.empresa_id ? session.empresa_id : empresaId

  const [files, setFiles] = useState<File[]>([])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const totalSizeMB = useMemo(
    () => (files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1),
    [files]
  )

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast.error('Subí al menos una imagen')
      return
    }
    setLoading(true)
    try {
      const drafts = await analyzeProducts({
        empresaId: effectiveEmpresaId,
        description,
        images: files,
      })
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
    <Card className="relative overflow-hidden border-border bg-card p-0">
      {/* Header con branding IA */}
      <div className="relative px-5 md:px-6 py-5 border-b border-border">
        <div className="absolute inset-0 gradient-brand opacity-[0.07]" />
        <div className="relative flex items-center gap-3">
          <span className="h-10 w-10 rounded-lg grid place-items-center gradient-brand text-white shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold">Carga inteligente con IA</h2>
              <Badge className="bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15">
                Beta
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Subí una foto por producto. Detectamos nombre, precio y categoría automáticamente.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-6 py-5 space-y-6">
        {/* Imágenes */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5 inline mr-1" /> Fotos de los productos
            </Label>
            {files.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {files.length} imagen{files.length === 1 ? '' : 'es'} · {totalSizeMB} MB
              </span>
            )}
          </div>
          <ImageMultiUploader files={files} onChange={setFiles} disabled={loading} />
        </div>

        {/* Hint card */}
        <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
          <Lightbulb className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Tip:</span> Si todas las fotos son del mismo rubro,
            mencionalo abajo (ej. <em>“zapatillas, todas a $45.000”</em>) para que la IA infiera mejor categoría y precio.
          </p>
        </div>

        {/* Indicaciones */}
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Indicaciones para la IA <span className="text-muted-foreground/60">(opcional)</span>
          </Label>
          <Textarea
            placeholder="Ej: Zapatillas deportivas, todas a $45.000. Hay modelos de running y urbanos."
            className="h-24 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* CTA */}
        <Button
          onClick={handleAnalyze}
          disabled={loading || files.length === 0}
          className="w-full h-12 gradient-brand text-white font-semibold hover:opacity-95 disabled:opacity-50"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analizando {files.length} imagen{files.length === 1 ? '' : 'es'}…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analizar con IA
            </>
          )}
        </Button>

        {files.length === 0 && (
          <p className="text-center text-xs text-muted-foreground -mt-1">
            Subí al menos una imagen para continuar.
          </p>
        )}
      </div>
    </Card>
  )
}
