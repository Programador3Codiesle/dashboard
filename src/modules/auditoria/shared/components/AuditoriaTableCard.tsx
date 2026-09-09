import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  testId?: string;
};

export function AuditoriaTableCard({
  children,
  footer,
  testId = 'auditoria-table',
}: Props) {
  return (
    <div className="app-section-card w-full min-w-0">
      <div data-testid={testId} className="app-table-scroll">
        {children}
      </div>
      {footer}
    </div>
  );
}
