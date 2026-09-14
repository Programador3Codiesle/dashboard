import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';

const ChecklistCarroGestion = dynamic(
  () =>
    import(
      '@/modules/informes/gestion-humana/checklist-carro/components/ChecklistCarroGestion'
    ).then((module) => module.ChecklistCarroGestion),
  {
    loading: () => <PageLoadingSkeleton />,
  },
);

export default function Page() {
  return <ChecklistCarroGestion />;
}
