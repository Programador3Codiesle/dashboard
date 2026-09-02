"use client";

import { SubmodulosHub } from "@/components/shared/hub/SubmodulosHub";
import { COTIZAR_HUB_ITEMS } from "@/modules/cotizar/hub/items";
import { COTIZAR_COPY } from "@/modules/cotizar/constants";

export function CotizarHub() {
  return (
    <SubmodulosHub
      title={COTIZAR_COPY.hubTitle}
      description={COTIZAR_COPY.hubDescription}
      items={COTIZAR_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3"
      filter={{ permission: "submenu" }}
      emptyWhenFiltered
    />
  );
}
