import { MemberPresentDto } from "./member-present.dto";

export interface MemberSearchDto {
  page: number;
  perPage: number;
  filter: string;
  sortBy: "role" | "status" | "createdAt" | "updatedAt";
  sortDirection: "asc" | "desc";
}

export interface OrganizationSearchPresentDto {
  items: MemberPresentDto[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
    sortBy: string | null;
    sortDirection: "asc" | "desc";
    filter: string;
  };
}
