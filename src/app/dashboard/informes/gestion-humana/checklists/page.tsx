import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';

const ChecklistsInformeView = dynamic(
  () =>
    import('@/modules/informes/gestion-humana/checklists/components/ChecklistsInformeView').then(
      (module) => module.ChecklistsInformeView,
    ),
  {
    loading: () => <PageLoadingSkeleton />,
  },
);

export default function ChecklistsPage() {
  return <ChecklistsInformeView />;
}
