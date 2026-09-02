import { Pagination } from '@/components/shared/ui/Pagination';
import { AUDITORIA_PAGE_SIZE } from '@/modules/auditoria/shared/utils/paginate';

type Props = {
  total: number;
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  inicio: number;
  fin: number;
};

export function AuditoriaPager({
  total,
  page,
  totalPages,
  onChange,
  inicio,
  fin,
}: Props) {
  if (total === 0) return null;
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500">
        Mostrando {inicio}–{fin} de {total} ({AUDITORIA_PAGE_SIZE} por página)
      </p>
      {totalPages > 1 ? (
        <Pagination currentPage={page} totalPages={totalPages} onChange={onChange} />
      ) : null}
    </div>
  );
}
