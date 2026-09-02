"use client";

import { useSearchParams } from "next/navigation";
import { MpviGestionJefe } from "@/components/taller/mpvi/jefe/MpviGestionJefe";
import { MPVI_SUBMENU_IDS } from "@/utils/constants";
import { useTallerPageGuard } from "@/modules/taller/shared/hooks/useTallerPageGuard";
import { TallerPageFrame } from "@/modules/taller/components/TallerPageFrame";
import { TALLER_COPY } from "@/modules/taller/constants";

export function MpviJefeTallerGestion() {
  const { blocked } = useTallerPageGuard(MPVI_SUBMENU_IDS.jefeTaller);
  const searchParams = useSearchParams();
  const idParam = searchParams.get("idCotizacion");
  const idCotizacion = idParam ? parseInt(idParam, 10) : null;
  const fromContact = idCotizacion != null && !Number.isNaN(idCotizacion);

  if (blocked) return null;

  return (
    <TallerPageFrame
      title={TALLER_COPY.mpviJefe.title}
      description={TALLER_COPY.mpviJefe.description}
    >
      <MpviGestionJefe
        op={fromContact ? 2 : 1}
        initialIdCotizacion={fromContact ? idCotizacion : null}
        showBackLink={fromContact}
      />
    </TallerPageFrame>
  );
}
