import { ChecklistFormGestion } from '@/modules/checklist/components/ChecklistFormGestion';
import { FORM_CABINA } from '@/modules/checklist/shared/definitions/form-configs';
import { CHECKLIST_CABINA_PINTURA_SUBMENU_ID } from '@/utils/constants';

export default function CabinaPinturaPage() {
  return (
    <ChecklistFormGestion
      submenuId={CHECKLIST_CABINA_PINTURA_SUBMENU_ID}
      config={FORM_CABINA}
    />
  );
}
