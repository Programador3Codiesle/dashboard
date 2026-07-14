'use client';

import { CHECKLIST_TIJERA_SUBMENU_ID } from '@/utils/constants';
import { ChecklistStandardForm } from '@/modules/checklist/shared/components/ChecklistStandardForm';
import { FORM_TIJERA } from '@/modules/checklist/shared/definitions/form-configs';
import { useChecklistPageGuard } from '@/modules/checklist/shared/hooks/useChecklistPageGuard';

export default function TijeraPage() {
  const { blocked } = useChecklistPageGuard(CHECKLIST_TIJERA_SUBMENU_ID);
  if (blocked) return null;
  return <ChecklistStandardForm config={FORM_TIJERA} />;
}
