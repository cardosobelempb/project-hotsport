import { SortDto } from "./sort.dto";

/**
 * Pageable metadata
 */
export interface PageableDto {
  sort: SortDto;
  offset: number;
  pageSize: number;
  pageNumber: number;
  paged: boolean;
  unpaged: boolean;
}
