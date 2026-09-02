import { ChecklistFormGestion } from '@/modules/checklist/components/ChecklistFormGestion';
import { FORM_ALINEADOR } from '@/modules/checklist/shared/definitions/form-configs';
import { CHECKLIST_ALINEADORES_SUBMENU_ID } from '@/utils/constants';

export default function AlineadoresPage() {
  return (
    <ChecklistFormGestion
      submenuId={CHECKLIST_ALINEADORES_SUBMENU_ID}
      config={FORM_ALINEADOR}
    />
  );
}
