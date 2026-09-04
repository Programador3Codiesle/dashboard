import Link from 'next/link';
import { CHECKLIST_COPY } from '@/modules/checklist/constants';

export function ChecklistBreadcrumb({ current }: { current: string }) {
  return (
    <nav className="flex flex-wrap items-baseline gap-x-1 gap-y-1 text-sm text-gray-500">
      <Link href="/dashboard/checklist" className="hover:underline">
        {CHECKLIST_COPY.breadcrumbHome}
      </Link>
      <span className="px-1">/</span>
      <span className="min-w-0 break-words text-gray-800">{current}</span>
    </nav>
  );
}
