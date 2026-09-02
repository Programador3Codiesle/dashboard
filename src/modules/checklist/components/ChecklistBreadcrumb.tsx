import Link from 'next/link';
import { CHECKLIST_COPY } from '@/modules/checklist/constants';

export function ChecklistBreadcrumb({ current }: { current: string }) {
  return (
    <nav className="text-sm text-gray-500">
      <Link href="/dashboard/checklist" className="hover:underline">
        {CHECKLIST_COPY.breadcrumbHome}
      </Link>
      <span className="mx-2">/</span>
      <span className="text-gray-800">{current}</span>
    </nav>
  );
}
