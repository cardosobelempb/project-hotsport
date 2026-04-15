export interface BasePagination {
  size?: number;
  page: number;
  sort?: [];
  direction?: "asc" | "desc";
  linesPerPage?: number;
  orderBy?: number;
}
