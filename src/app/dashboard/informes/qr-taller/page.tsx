import { SatisfaccionQrGestion } from '@/modules/encuestas/satisfaccion-qr/components/SatisfaccionQrGestion';
import { INFORME_QR_TALLER_SUBMENU_ID } from '@/utils/constants';

export default function InformeQrTallerPage() {
  return (
    <SatisfaccionQrGestion
      submenuId={INFORME_QR_TALLER_SUBMENU_ID}
      redirectTo="/dashboard/informes"
      frame="informes"
    />
  );
}
