export const AUDITORIA_PAGE_SIZE = 15;

export function paginateRows<T>(
  rows: T[],
  page: number,
  pageSize = AUDITORIA_PAGE_SIZE,
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
    inicio: total === 0 ? 0 : start + 1,
    fin: Math.min(safePage * pageSize, total),
  };
}
