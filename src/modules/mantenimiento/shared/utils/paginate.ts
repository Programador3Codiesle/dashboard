export function paginateRows<T>(
  rows: T[],
  page: number,
  pageSize: number,
) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    total,
    totalPages,
    safePage,
    pageRows: rows.slice(start, start + pageSize),
  };
}
