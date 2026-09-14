import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';

const ControlVehicularGestion = dynamic(
  () =>
    import(
      '@/modules/informes/gestion-humana/control-vehicular/components/ControlVehicularGestion'
    ).then((module) => module.ControlVehicularGestion),
  {
    loading: () => <PageLoadingSkeleton />,
  },
);

export default function ControlVehicularPage() {
  return <ControlVehicularGestion />;
}
