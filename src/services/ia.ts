import api from './api'
import type { ProductoDraft } from '@/types/batch'

interface AnalyzeResponse {
  status: number
  message: string
  data: Omit<ProductoDraft, '_localId'>[]
}

export async function analyzeProducts(params: {
  empresaId: number
  description: string
  images: File[]
}): Promise<ProductoDraft[]> {
  const fd = new FormData()
  fd.append('empresa_id', String(params.empresaId))
  fd.append('description', params.description)
  params.images.forEach((f) => fd.append('images[]', f))

  const { data } = await api.post<AnalyzeResponse>('/api/analizar_productos_ia', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000,
  })

  return data.data.map((d) => ({
    ...d,
    _localId: crypto.randomUUID(),
  }))
}