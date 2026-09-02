import { ChecklistFormGestion } from '@/modules/checklist/components/ChecklistFormGestion';
import { FORM_ELEVADORES } from '@/modules/checklist/shared/definitions/form-configs';
import { CHECKLIST_ELEVADORES_SUBMENU_ID } from '@/utils/constants';

export default function ElevadoresPage() {
  return (
    <ChecklistFormGestion
      submenuId={CHECKLIST_ELEVADORES_SUBMENU_ID}
      config={FORM_ELEVADORES}
    />
  );
}
