import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';

const ChecklistMotoGestion = dynamic(
  () =>
    import(
      '@/modules/informes/gestion-humana/checklist-moto/components/ChecklistMotoGestion'
    ).then((module) => module.ChecklistMotoGestion),
  {
    loading: () => <PageLoadingSkeleton />,
  },
);

export default function Page() {
  return <ChecklistMotoGestion />;
}
