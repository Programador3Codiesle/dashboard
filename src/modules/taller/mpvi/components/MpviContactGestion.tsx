"use client";

import { MpviGestionContact } from "@/components/taller/mpvi/contact/MpviGestionContact";
import { MPVI_SUBMENU_IDS } from "@/utils/constants";
import { useTallerPageGuard } from "@/modules/taller/shared/hooks/useTallerPageGuard";
import { TallerPageFrame } from "@/modules/taller/components/TallerPageFrame";
import { TALLER_COPY } from "@/modules/taller/constants";

export function MpviContactGestion() {
  const { blocked } = useTallerPageGuard(MPVI_SUBMENU_IDS.contact);

  if (blocked) return null;

  return (
    <TallerPageFrame
      title={TALLER_COPY.mpviContact.title}
      description={TALLER_COPY.mpviContact.description}
    >
      <MpviGestionContact />
    </TallerPageFrame>
  );
}
