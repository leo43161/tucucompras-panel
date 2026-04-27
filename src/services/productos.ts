import api from './api'
import type { ProductoDraft } from '@/types/batch'

interface Resp<T> { status: number; message: string; data: T }

export interface ProductoLoaded {
  id: number
  empresa_id: number
  nombre: string
  descripcion: string
  precio: number
  precio_oferta: number | null
  es_oferta: boolean
  imagen_principal_url: string
  categoria: { id: number; nombre: string }
  sub_categorias: { id: number; nombre: string }[]
}

interface BatchResponse {
  saved: { index: number; producto_id: number }[]
  failed: { index: number; error: string }[]
}

export async function guardarProductosLote(params: {
  empresaId: number
  products: ProductoDraft[]
}) {
  const payload = {
    empresa_id: params.empresaId,
    products: params.products.map(({ _localId, image_index, id, ...p }) => p),
  }
  const { data } = await api.post<Resp<BatchResponse>>('/api/ingresar_productos_lote', payload)
  return data.data
}

export async function listProductos(empresaId: number): Promise<ProductoLoaded[]> {
  const { data } = await api.get<Resp<ProductoLoaded[]>>('/api/listar_productos', {
    params: { empresa_id: empresaId },
  })
  return data.data
}

export async function editProducto(draft: ProductoDraft): Promise<void> {
  const { _localId, image_index, ...payload } = draft
  await api.post('/api/editar_producto', payload)
}

export async function deleteProducto(id: number): Promise<void> {
  await api.post('/api/eliminar_producto', { id })
}