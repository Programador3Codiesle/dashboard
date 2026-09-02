'use client';

import { ChecklistStandardForm } from '@/modules/checklist/shared/components/ChecklistStandardForm';
import type { FormularioChecklistConfig } from '@/modules/checklist/shared/definitions/form-configs';
import { useChecklistPageGuard } from '@/modules/checklist/shared/hooks/useChecklistPageGuard';

type Props = {
  submenuId: number;
  config: FormularioChecklistConfig;
};

export function ChecklistFormGestion({ submenuId, config }: Props) {
  const { blocked } = useChecklistPageGuard(submenuId);
  if (blocked) return null;
  return <ChecklistStandardForm config={config} />;
}
