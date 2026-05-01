import api from './api'
import type { Empresa, CreateEmpresaInput } from '@/types/domain'

interface ListResponse {
  status: number
  message: string
  data: Empresa[]
}

interface CreateResponse {
  status: number
  message: string
  data: {
    id_nueva_empresa: number
    raw_generated_password: string
  }
}

export interface EditEmpresaPayload {
  id: number
  nombre: string
  cuit?: string | null
  whatsapp_contacto: string
  sitio_web?: string | null
  direccion?: string | null
  logo_url?: string | null
  banner_url?: string | null
  latitud?: number | null
  longitud?: number | null
}

export async function listEmpresas(): Promise<Empresa[]> {
  const { data } = await api.get<ListResponse>('/api/listar_empresas')
  return data.data
}

export async function createEmpresa(input: CreateEmpresaInput): Promise<CreateResponse['data']> {
  const { data } = await api.post<CreateResponse>('/api/crear_empresa', input)
  return data.data
}

export async function editEmpresa(payload: EditEmpresaPayload): Promise<void> {
  await api.post('/api/editar_empresa', payload)
}

export async function deleteEmpresa(id: number): Promise<void> {
  await api.post('/api/eliminar_empresa', { id })
}
