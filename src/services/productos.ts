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
  visible?: 0 | 1 | boolean
  activo?: 0 | 1 | boolean
  producto_visible?: 0 | 1
  producto_activo?: 0 | 1
  categoria: { id: number; nombre: string }
  sub_categorias: { id: number; nombre: string }[]
}

export interface ManualProductInput {
  empresa_id: number
  categoria_id: number
  sub_categoria_id: number
  nombre: string
  descripcion?: string
  precio: number
  precio_oferta?: number | null
  es_oferta?: boolean
  imagen_principal_url?: string
  visible?: 0 | 1
  activo?: 0 | 1
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
    products: params.products.map(({ _localId, image_index, id, ...p }) => ({
      ...p,
      descripcion: p.descripcion?.trim() || null,
      imagen_principal_url: p.imagen_principal_url?.trim() || null,
      precio_oferta: p.precio_oferta ?? null,
    })),
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
  const { _localId, image_index, ...rest } = draft
  const payload = {
    ...rest,
    descripcion: rest.descripcion?.trim() || null,
    imagen_principal_url: rest.imagen_principal_url?.trim() || null,
    precio_oferta: rest.precio_oferta ?? null,
  }
  await api.post('/api/editar_producto', payload)
}

export async function deleteProducto(id: number): Promise<void> {
  await api.post('/api/eliminar_producto', { id })
}

export async function toggleEstadoProducto(
  id: number,
  campo: 'activo' | 'visible',
  valor: 0 | 1
): Promise<void> {
  await api.post('/api/toggle_producto_estado', { id, campo, valor })
}

export async function crearProductoManual(input: ManualProductInput): Promise<{ id_nuevo_producto: number }> {
  const { data } = await api.post<{ status: number; message: string; id_producto: number }>(
    '/api/ingresar_producto',
    input,
  )
  return { id_nuevo_producto: (data as any).id_producto }
}

/** Helper para normalizar visible/activo (soporta 0|1, true|false, producto_visible/activo). */
export function getEstado(p: ProductoLoaded): { activo: boolean; visible: boolean } {
  const a = p.activo ?? p.producto_activo
  const v = p.visible ?? p.producto_visible
  return {
    activo: a === undefined ? true : Boolean(Number(a)),
    visible: v === undefined ? true : Boolean(Number(v)),
  }
}

/** Helper para subir UNA imagen al endpoint /api/upload. Devuelve la URL relativa servida por la API. */
export async function uploadProductImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('imagen', file)
  const { data } = await api.post<{ status: number; url?: string; message?: string }>(
    '/api/upload',
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  if (data.status !== 200 || !data.url) {
    throw new Error(data.message || 'No se pudo subir la imagen')
  }
  return data.url
}
