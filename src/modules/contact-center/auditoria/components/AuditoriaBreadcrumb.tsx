import Link from 'next/link';

type AuditoriaBreadcrumbProps = {
  current: string;
};

export function AuditoriaBreadcrumb({ current }: AuditoriaBreadcrumbProps) {
  return (
    <nav className="text-sm text-gray-500">
      <Link href="/dashboard/contact-center/auditoria" className="hover:underline">
        Auditoría
      </Link>
      <span className="mx-2">/</span>
      <span className="text-gray-800">{current}</span>
    </nav>
  );
}
