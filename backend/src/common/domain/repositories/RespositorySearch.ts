export type SearchInput = {
  page?: number
  perPage?: number // substitui size
  filter?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export type SearchOutput<Entity> = {
  items: Entity[]
  total: number
  totalPages: number
  currentPage: number
  perPage: number
  sortBy?: string // opcional agora
  sortDirection?: 'asc' | 'desc'
  filter: string
}
