import Link from 'next/link';

type AuditoriaBreadcrumbProps = {
  current: string;
};

export function AuditoriaBreadcrumb({ current }: AuditoriaBreadcrumbProps) {
  return (
    <nav className="flex flex-wrap items-baseline gap-x-1 gap-y-1 text-sm text-gray-500">
      <Link href="/dashboard/contact-center/auditoria" className="hover:underline">
        Auditoría
      </Link>
      <span className="px-1">/</span>
      <span className="min-w-0 break-words text-gray-800">{current}</span>
    </nav>
  );
}
