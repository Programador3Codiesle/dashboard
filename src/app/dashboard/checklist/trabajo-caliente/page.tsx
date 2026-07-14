'use client';

import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';
import { CHECKLIST_TRABAJO_CALIENTE_SUBMENU_ID } from '@/utils/constants';
import { useChecklistPageGuard } from '@/modules/checklist/shared/hooks/useChecklistPageGuard';

const LaborCalorForm = dynamic(
  () =>
    import('@/modules/checklist/forms/LaborCalorForm').then((module) => module.LaborCalorForm),
  { loading: () => <PageLoadingSkeleton /> },
);

export default function TrabajoCalientePage() {
  const { blocked } = useChecklistPageGuard(CHECKLIST_TRABAJO_CALIENTE_SUBMENU_ID);
  if (blocked) return null;
  return <LaborCalorForm />;
}
