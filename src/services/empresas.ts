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

export async function listEmpresas(): Promise<Empresa[]> {
  const { data } = await api.get<ListResponse>('/api/listar_empresas')
  return data.data
}

export async function createEmpresa(input: CreateEmpresaInput): Promise<CreateResponse['data']> {
  const { data } = await api.post<CreateResponse>('/api/crear_empresa', input)
  return data.data
}