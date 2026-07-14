'use client';

import { CHECKLIST_VEHICULO_SUBMENU_ID } from '@/utils/constants';
import { ChecklistExternalRedirect } from '@/modules/checklist/components/ChecklistExternalRedirect';
import { useChecklistPageGuard } from '@/modules/checklist/shared/hooks/useChecklistPageGuard';

export default function VehiculoPage() {
  const { blocked } = useChecklistPageGuard(CHECKLIST_VEHICULO_SUBMENU_ID);
  if (blocked) return null;
  return <ChecklistExternalRedirect tipo="vehiculo" />;
}
