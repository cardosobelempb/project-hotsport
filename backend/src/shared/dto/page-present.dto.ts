import { PageableDto } from "./pageable.dto";
import { SortDto } from "./sort.dto";

/**
 * DTO genérico de resposta paginada.
 * Espelha exatamente o contrato Spring Data Page<T>.
 *
 * @template T - Tipo do conteúdo da página
 *
 * @example
 * // Controller retornando Page de Organizations
 * return PagePresentDto.fromPage(page, OrganizationPresentDto);
 */
export interface PagePresentDto<T> {
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
