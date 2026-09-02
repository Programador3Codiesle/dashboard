import { ChecklistFormGestion } from '@/modules/checklist/components/ChecklistFormGestion';
import { FORM_PORTICO } from '@/modules/checklist/shared/definitions/form-configs';
import { CHECKLIST_PORTICO_SUBMENU_ID } from '@/utils/constants';

export default function PorticoPage() {
  return (
    <ChecklistFormGestion submenuId={CHECKLIST_PORTICO_SUBMENU_ID} config={FORM_PORTICO} />
  );
}
