import api from './api'
import type { ProductoDraft } from '@/types/batch'

interface BatchResponse {
  status: number
  message: string
  data: {
    saved: { index: number; producto_id: number }[]
    failed: { index: number; error: string }[]
  }
}

export async function guardarProductosLote(params: {
  empresaId: number
  products: ProductoDraft[]
}) {
  const payload = {
    empresa_id: params.empresaId,
    products: params.products.map(({ _localId, image_index, ...p }) => p),
  }
  const { data } = await api.post<BatchResponse>('/api/ingresar_productos_lote', payload)
  return data.data
}