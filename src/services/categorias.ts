import api from './api'

export interface Categoria { id: number; nombre: string; slug: string }
export interface SubCategoria { id: number; categoria_id: number; nombre: string; slug: string }

interface Resp<T> { status: number; message: string; data: T }

export async function listCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Resp<Categoria[]>>('/api/listar_categorias')
  return data.data
}

export async function listSubCategorias(categoriaId?: number): Promise<SubCategoria[]> {
  const { data } = await api.get<Resp<SubCategoria[]>>('/api/listar_sub_categorias', {
    params: categoriaId ? { categoria_id: categoriaId } : {},
  })
  return data.data
}