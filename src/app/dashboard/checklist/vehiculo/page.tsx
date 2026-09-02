import { ChecklistExternalPageGestion } from '@/modules/checklist/components/ChecklistExternalPageGestion';
import { CHECKLIST_VEHICULO_SUBMENU_ID } from '@/utils/constants';

export default function VehiculoPage() {
  return (
    <ChecklistExternalPageGestion submenuId={CHECKLIST_VEHICULO_SUBMENU_ID} tipo="vehiculo" />
  );
}
