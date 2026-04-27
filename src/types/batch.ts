export interface CategoriaRef {
  id?: number
  nombre: string
}

export interface SubCategoriaRef {
  id?: number
  nombre: string
}

export interface ProductoDraft {
  _localId?: string           // ← opcional
  image_index?: number        // ← opcional
  id?: number                 // ← NUEVO: id real si es un producto existente
  imagen_principal_url: string
  nombre: string
  descripcion: string
  precio: number
  precio_oferta: number | null
  es_oferta: boolean
  categoria: CategoriaRef
  sub_categorias: SubCategoriaRef[]
}