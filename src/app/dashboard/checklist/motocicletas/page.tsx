import { ChecklistExternalPageGestion } from '@/modules/checklist/components/ChecklistExternalPageGestion';
import { CHECKLIST_MOTOCICLETAS_SUBMENU_ID } from '@/utils/constants';

export default function MotocicletasPage() {
  return (
    <ChecklistExternalPageGestion
      submenuId={CHECKLIST_MOTOCICLETAS_SUBMENU_ID}
      tipo="motocicletas"
    />
  );
}
