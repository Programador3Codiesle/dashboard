import Link from 'next/link';
import type { ReactNode } from 'react';
import { PageTitleRow } from '@/components/shared/layout/PageTitleRow';

type Props = {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function OrdenesTotPageFrame({
  title,
  description,
  backHref = '/dashboard/ordenes-tot',
  backLabel = '← Volver a Órdenes & TOT',
  children,
}: Props) {
  return (
    <div data-testid="ordenes-tot-page" className="w-full min-w-0 space-y-4 sm:space-y-6">
      <PageTitleRow
        title={title}
        description={description}
        headingClassName="app-title-xl brand-text"
        descriptionClassName="mt-1 text-gray-600"
        actions={
          <Link
            href={backHref}
            className="text-sm brand-text hover:underline sm:shrink-0"
          >
            {backLabel}
          </Link>
        }
      />
      {children}
    </div>
  );
}
