import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

export function AuditoriaTableCard({ children, footer }: Props) {
  return (
    <div className="app-section-card w-full min-w-0">
      <div className="app-table-scroll">{children}</div>
      {footer}
    </div>
  );
}
