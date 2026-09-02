import Link from 'next/link';
import type { ReactNode } from 'react';
import { INFORMES_COPY } from '@/modules/informes/constants';
import { PageTitleRow } from '@/components/shared/layout/PageTitleRow';

type Props = {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function InformesPageFrame({
  title,
  description,
  backHref = '/dashboard/informes',
  backLabel = INFORMES_COPY.backRoot,
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
