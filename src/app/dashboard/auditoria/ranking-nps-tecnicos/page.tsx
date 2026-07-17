'use client';

import PacNpsInternoDetalladoPage from '@/app/dashboard/informes/postventa/pac-nps-interno-detallado/page';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { RANKING_NPS_TECNICOS_SUBMENU_ID } from '@/utils/constants';
import Link from 'next/link';

export default function RankingNpsTecnicosAuditoriaPage() {
  const { blocked } = useAuditoriaPageGuard(RANKING_NPS_TECNICOS_SUBMENU_ID);
  if (blocked) return null;
  return (
    <div className="space-y-3">
      <Link
        href="/dashboard/auditoria"
        className="text-sm text-amber-700 hover:underline"
      >
        ← Volver a Auditoría
      </Link>
      <PacNpsInternoDetalladoPage />
    </div>
  );
}
