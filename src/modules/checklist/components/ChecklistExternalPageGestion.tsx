'use client';

import { ChecklistExternalRedirect } from '@/modules/checklist/components/ChecklistExternalRedirect';
import type { ChecklistExternalTipo } from '@/modules/checklist/constants';
import { useChecklistPageGuard } from '@/modules/checklist/shared/hooks/useChecklistPageGuard';

type Props = {
  submenuId: number;
  tipo: ChecklistExternalTipo;
};

export function ChecklistExternalPageGestion({ submenuId, tipo }: Props) {
  const { blocked } = useChecklistPageGuard(submenuId);
  if (blocked) return null;
  return <ChecklistExternalRedirect tipo={tipo} />;
}
