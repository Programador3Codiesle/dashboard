'use client';

import { CHECKLIST_ALINEADORES_SUBMENU_ID } from '@/utils/constants';
import { ChecklistStandardForm } from '@/modules/checklist/shared/components/ChecklistStandardForm';
import { FORM_ALINEADOR } from '@/modules/checklist/shared/definitions/form-configs';
import { useChecklistPageGuard } from '@/modules/checklist/shared/hooks/useChecklistPageGuard';

export default function AlineadoresPage() {
  const { blocked } = useChecklistPageGuard(CHECKLIST_ALINEADORES_SUBMENU_ID);
  if (blocked) return null;
  return <ChecklistStandardForm config={FORM_ALINEADOR} />;
}
