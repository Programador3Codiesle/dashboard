'use client';

import PacNpsInternoDetalladoPage from '@/app/dashboard/informes/postventa/pac-nps-interno-detallado/page';
import { AuditoriaPageFrame } from '@/modules/auditoria/components/AuditoriaPageFrame';
import { AUDITORIA_COPY } from '@/modules/auditoria/constants';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { RANKING_NPS_TECNICOS_SUBMENU_ID } from '@/utils/constants';

export function RankingNpsTecnicosGestion() {
  const { blocked } = useAuditoriaPageGuard(RANKING_NPS_TECNICOS_SUBMENU_ID);
  if (blocked) return null;
  return (
    <AuditoriaPageFrame backLabel={AUDITORIA_COPY.backLabel}>
      <div className="w-full min-w-0">
        <PacNpsInternoDetalladoPage />
      </div>
    </AuditoriaPageFrame>
  );
}
