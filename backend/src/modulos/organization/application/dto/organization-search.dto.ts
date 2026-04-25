import { OrganizationPresentDto } from "./organization-present.dto";

export interface OrganizationSearchDto {
  page: number;
  perPage: number;
  filter: string;
  sortBy: "name" | "slug" | "status" | "createdAt" | "updatedAt";
  sortDirection: "asc" | "desc";
}

// export interface OrganizationSearchPresentDto {
//   items: OrganizationPresentDto[];
//   meta: {
//     currentPage: number;
//     perPage: number;
//     total: number;
//     totalPages: number;
//     sortBy: string | null;
//     sortDirection: "asc" | "desc";
//     filter: string;
//   };
// }

export interface OrganizationSearchPresentDto {
  items: OrganizationPresentDto[];
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  sortBy: string | null;
  sortDirection: "asc" | "desc";
  filter: string;
}
