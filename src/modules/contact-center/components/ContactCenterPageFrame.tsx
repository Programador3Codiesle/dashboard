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
    <div
      data-testid="contact-center-page"
      className="w-full min-w-0 space-y-4 sm:space-y-6"
    >
      <PageTitleRow
        title={title}
        description={description}
        headingClassName="app-title-xl brand-text"
        descriptionClassName="text-gray-600 mt-1"
      />
      {children}
    </div>
  );
}
