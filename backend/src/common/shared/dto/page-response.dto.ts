// ============================================================
// page-response.dto.ts
// DTO genérico de resposta paginada — contrato Spring Data Page
// ============================================================

export interface SortDto {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface PageableDto {
  sort: SortDto;
  offset: number;
  pageSize: number;
  pageNumber: number;
  paged: boolean;
  unpaged: boolean;
}

/**
 * DTO genérico de resposta paginada.
 * Espelha exatamente o contrato Spring Data Page<T>.
 *
 * @template T - Tipo do conteúdo da página
 *
 * @example
 * // Controller retornando Page de Organizations
 * return PageResponseDto.fromPage(page, OrganizationPresentDto);
 */
export interface PageResponseDto<T> {
  content: T[];
  pageable: PageableDto;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: SortDto;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
