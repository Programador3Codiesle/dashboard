"use client";

import { SubmodulosHub } from "@/components/shared/hub/SubmodulosHub";
import { NOMINA_HUB_ITEMS } from "@/modules/nomina/hub/items";
import { NOMINA_COPY } from "@/modules/nomina/constants";

export function NominaHub() {
  return (
    <SubmodulosHub
      title={NOMINA_COPY.hubTitle}
      description={NOMINA_COPY.hubDescription}
      items={NOMINA_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      filter={{ permission: "submenu" }}
      emptyWhenFiltered
    />
  );
}
