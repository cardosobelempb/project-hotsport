// ============================================================
// pagination.types.ts
// Tipos que espelham exatamente o contrato do Spring Data Page.
// Referência: org.springframework.data.domain.Page
// ============================================================

/**
 * Espelha: org.springframework.data.domain.Sort.SortOrder
 *
 * @example Resposta Spring Boot:
 * "sort": { "sorted": true, "unsorted": false, "empty": false }
 */
export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

/**
 * Espelha: org.springframework.data.domain.Pageable
 *
 * @example Resposta Spring Boot:
 * "pageable": {
 *   "sort": { "sorted": false, "unsorted": true, "empty": true },
 *   "offset": 0,
 *   "pageSize": 10,
 *   "pageNumber": 0,
 *   "paged": true,
 *   "unpaged": false
 * }
 */
export interface Pageable {
  sort: Sort;
  offset: number;
  pageSize: number;
  pageNumber: number;
  paged: boolean;
  unpaged: boolean;
}

/**
 * Espelha: org.springframework.data.domain.Page<T>
 *
 * Estrutura completa retornada por endpoints paginados do Spring Boot.
 * Todos os campos refletem exatamente o JSON serializado pelo Jackson.
 *
 * @template T - Tipo do conteúdo retornado na página
 *
 * @example Resposta Spring Boot:
 * {
 *   "content": [...],
 *   "pageable": { ... },
 *   "totalPages": 5,
 *   "totalElements": 48,
 *   "last": false,
 *   "size": 10,
 *   "number": 0,
 *   "sort": { ... },
 *   "numberOfElements": 10,
 *   "first": true,
 *   "empty": false
 * }
 */
export interface Page<T> {
  content: T[];
  pageable: Pageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Parâmetros de entrada para requisições paginadas.
 * Alinhados ao PageableHandlerMethodArgumentResolver do Spring Boot.
 *
 * @example GET /organizations?page=0&size=10&sort=name,asc&filter=acme
 */
export interface PageInput {
  page?: number | undefined; // Zero-based — padrão Spring: 0
  size?: number | undefined; // Itens por página — padrão Spring: 20
  sort?: string | undefined; // Formato: 'campo,direção' → ex: 'name,asc' | 'createdAt,desc'
  filter?: string | undefined; // Filtro textual livre (extensão customizada)
}
