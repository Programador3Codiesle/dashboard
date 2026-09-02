'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CHECKLIST_COPY,
  CHECKLIST_EXTERNAL_URLS,
  type ChecklistExternalTipo,
} from '@/modules/checklist/constants';

export function ChecklistExternalRedirect({ tipo }: { tipo: ChecklistExternalTipo }) {
  const router = useRouter();

  useEffect(() => {
    window.open(CHECKLIST_EXTERNAL_URLS[tipo], '_blank', 'noopener,noreferrer');
    router.replace('/dashboard/checklist');
  }, [tipo, router]);

  return (
    <p className="py-8 text-center text-sm text-gray-500">{CHECKLIST_COPY.redirectVentas}</p>
  );
}
