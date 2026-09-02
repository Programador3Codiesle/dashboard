import { ChecklistFormGestion } from '@/modules/checklist/components/ChecklistFormGestion';
import { FORM_TIJERA } from '@/modules/checklist/shared/definitions/form-configs';
import { CHECKLIST_TIJERA_SUBMENU_ID } from '@/utils/constants';

export default function TijeraPage() {
  return (
    <ChecklistFormGestion submenuId={CHECKLIST_TIJERA_SUBMENU_ID} config={FORM_TIJERA} />
  );
}
