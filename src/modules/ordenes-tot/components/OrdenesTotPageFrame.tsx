import type { ReactNode } from 'react';
import { PageTitleRow } from '@/components/shared/layout/PageTitleRow';

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export function OrdenesTotPageFrame({ title, description, children }: Props) {
  return (
    <div className="space-y-6">
      <PageTitleRow
        title={title}
        description={description}
        descriptionClassName="mt-1 text-gray-600"
      />
      {children}
    </div>
  );
}
