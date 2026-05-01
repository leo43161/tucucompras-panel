export interface Empresa {
  id: number
  nombre: string
  cuit: string | null
  whatsapp_contacto: string
  sitio_web: string | null
  logo_url: string | null
  banner_url: string | null
  direccion: string | null
  latitud: number | null
  longitud: number | null
  visible: 0 | 1
  activo: 0 | 1
  fecha_creacion: string
}

export interface CreateEmpresaInput {
  nombre: string
  cuit?: string
  whatsapp_contacto: string
  sitio_web?: string
  direccion?: string
  latitud?: number
  longitud?: number
  logo_url?: string
  banner_url?: string
  email: string
  nombre_completo: string
}

export interface ApiList<T> {
  data: T[]
  total?: number
}

export interface ApiItem<T> {
  data: T
}