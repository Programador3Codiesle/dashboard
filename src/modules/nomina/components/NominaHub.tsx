"use client";

import { SubmodulosHub } from "@/components/shared/hub/SubmodulosHub";
import { CODIESEL_EMPRESA_ID } from "@/utils/constants";
import { NOMINA_HUB_ITEMS } from "@/modules/nomina/hub/items";
import { NOMINA_COPY } from "@/modules/nomina/constants";
import { useNominaPageGuard } from "@/modules/nomina/shared/hooks/useNominaPageGuard";

export function NominaHub() {
  const { blocked } = useNominaPageGuard();
  if (blocked) return null;

  return (
    <SubmodulosHub
      title={NOMINA_COPY.hubTitle}
      description={NOMINA_COPY.hubDescription}
      items={NOMINA_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID, permission: "submenu" }}
      emptyWhenFiltered
    />
  );
}
