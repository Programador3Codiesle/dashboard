'use client';

import { CHECKLIST_MOTOCICLETAS_SUBMENU_ID } from '@/utils/constants';
import { ChecklistExternalRedirect } from '@/modules/checklist/components/ChecklistExternalRedirect';
import { useChecklistPageGuard } from '@/modules/checklist/shared/hooks/useChecklistPageGuard';

export default function MotocicletasPage() {
  const { blocked } = useChecklistPageGuard(CHECKLIST_MOTOCICLETAS_SUBMENU_ID);
  if (blocked) return null;
  return <ChecklistExternalRedirect tipo="motocicletas" />;
}
