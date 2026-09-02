import { ChecklistFormGestion } from '@/modules/checklist/components/ChecklistFormGestion';
import { FORM_HIDRAULICOS } from '@/modules/checklist/shared/definitions/form-configs';
import { CHECKLIST_HIDRAULICOS_SUBMENU_ID } from '@/utils/constants';

export default function HidraulicosPage() {
  return (
    <ChecklistFormGestion
      submenuId={CHECKLIST_HIDRAULICOS_SUBMENU_ID}
      config={FORM_HIDRAULICOS}
    />
  );
}
