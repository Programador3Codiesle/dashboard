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

export function EncuestasPageFrame({
  title,
  description,
  backHref,
  backLabel,
  children,
}: Props) {
  return (
    <div className="space-y-6">
      <PageTitleRow
        title={title}
        description={description}
        descriptionClassName="mt-1 text-gray-600"
        actions={
          backHref && backLabel ? (
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
