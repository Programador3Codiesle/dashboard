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
    <div className="space-y-4">
      <PageTitleRow
        title={title}
        description={description}
        descriptionClassName="mt-1 text-gray-600"
        actions={
          backLabel ? (
            <Link href={backHref} className="text-sm brand-text hover:underline">
              {backLabel}
            </Link>
          ) : null
        }
      />
      {children}
    </div>
  );
}
