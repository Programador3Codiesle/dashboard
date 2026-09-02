import type { ReactNode } from 'react';
import { PageTitleRow } from '@/components/shared/layout/PageTitleRow';

type ContactCenterPageFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ContactCenterPageFrame({
  title,
  description,
  children,
}: ContactCenterPageFrameProps) {
  return (
    <div className="space-y-6">
      <PageTitleRow
        title={title}
        description={description}
        descriptionClassName="text-gray-600 mt-1"
      />
      {children}
    </div>
  );
}
