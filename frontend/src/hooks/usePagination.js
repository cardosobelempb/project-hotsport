import { useEffect, useMemo, useState } from "react";

export default function usePagination(data = [], itemsPerPage = 12) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, page, itemsPerPage]);

  return { pageData, page, setPage, totalPages, total: data.length };
}
