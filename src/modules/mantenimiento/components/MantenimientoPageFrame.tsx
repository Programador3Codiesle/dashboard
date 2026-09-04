import Link from 'next/link';
import type { ReactNode } from 'react';
import { MANTENIMIENTO_COPY } from '@/modules/mantenimiento/constants';
import { PageTitleRow } from '@/components/shared/layout/PageTitleRow';

type Props = {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function MantenimientoPageFrame({
  title,
  description,
  backHref = '/dashboard/mantenimiento',
  backLabel = MANTENIMIENTO_COPY.backLabel,
  children,
}: Props) {
  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <PageTitleRow
        title={title}
        description={description}
        headingClassName="app-title-xl brand-text"
        descriptionClassName="mt-1 text-gray-600"
        actions={
          backLabel ? (
            <Link
              href={backHref}
              className="text-sm brand-text hover:underline sm:shrink-0"
            >
              {backLabel}
            </Link>
          ) : null
        }
      />
      {children}
    </div>
  );
}
