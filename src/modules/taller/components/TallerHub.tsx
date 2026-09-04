"use client";

import { SubmodulosHub } from "@/components/shared/hub/SubmodulosHub";
import { TALLER_HUB_ITEMS } from "@/modules/taller/hub/items";
import { TALLER_COPY } from "@/modules/taller/constants";

export function TallerHub() {
  return (
    <SubmodulosHub
      title={TALLER_COPY.hubTitle}
      description={TALLER_COPY.hubDescription}
      items={TALLER_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      filter={{ permission: "submenu" }}
      emptyWhenFiltered
    />
  );
}
