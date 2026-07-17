'use client';

import Link from 'next/link';
import { InformePosiblesRetornosGestion } from '@/modules/taller/informe-posibles-retornos/components/InformePosiblesRetornosGestion';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { RETORNOS_POR_SEDE_SUBMENU_ID } from '@/utils/constants';

export default function RetornosPorSedeAuditoriaPage() {
  const { blocked } = useAuditoriaPageGuard(RETORNOS_POR_SEDE_SUBMENU_ID);
  if (blocked) return null;
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-title-xl brand-text">Retornos por Sede</h1>
          <p className="mt-1 text-gray-500">
            Comparativo mensual de entradas, retornos y posibles retornos
          </p>
        </div>
        <Link
          href="/dashboard/auditoria"
          className="text-sm text-amber-700 hover:underline"
        >
          ← Volver a Auditoría
        </Link>
      </div>
      <InformePosiblesRetornosGestion />
    </div>
  );
}
