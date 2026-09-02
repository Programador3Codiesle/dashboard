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
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      filter={{ permission: "submenu" }}
      emptyWhenFiltered
    />
  );
}
