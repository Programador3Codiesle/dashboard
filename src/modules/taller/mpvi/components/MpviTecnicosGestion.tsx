"use client";

import { MpviGestionTecnico } from "@/components/taller/mpvi/tecnicos/MpviGestionTecnico";
import { MPVI_SUBMENU_IDS } from "@/utils/constants";
import { useTallerPageGuard } from "@/modules/taller/shared/hooks/useTallerPageGuard";
import { TallerPageFrame } from "@/modules/taller/components/TallerPageFrame";
import { TALLER_COPY } from "@/modules/taller/constants";

export function MpviTecnicosGestion() {
  const { blocked } = useTallerPageGuard(MPVI_SUBMENU_IDS.tecnicos);

  if (blocked) return null;

  return (
    <TallerPageFrame
      title={TALLER_COPY.mpviTecnicos.title}
      description={TALLER_COPY.mpviTecnicos.description}
    >
      <MpviGestionTecnico />
    </TallerPageFrame>
  );
}
