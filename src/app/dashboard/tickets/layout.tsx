import { TicketsLayout } from '@/modules/tickets/components/TicketsLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TicketsLayout>{children}</TicketsLayout>;
}
