import Link from 'next/link';
import type { ReactNode } from 'react';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import { PageTitleRow } from '@/components/shared/layout/PageTitleRow';

type Props = {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function AdministracionPageFrame({
  title,
  description,
  backHref = '/dashboard/administracion',
  backLabel = ADMINISTRACION_COPY.backLabel,
  children,
}: Props) {
  return (
    <div className="space-y-6">
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
