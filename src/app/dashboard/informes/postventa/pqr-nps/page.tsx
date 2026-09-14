import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';

const PqrNpsGestion = dynamic(
  () =>
    import('@/modules/informes/postventa/pqr-nps/components/PqrNpsGestion').then(
      (module) => module.PqrNpsGestion,
    ),
  {
    loading: () => <PageLoadingSkeleton />,
  },
);

export default function PqrNpsPage() {
  return <PqrNpsGestion />;
}
