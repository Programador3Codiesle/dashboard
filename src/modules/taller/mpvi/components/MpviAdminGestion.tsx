"use client";

import { useState } from "react";
import { MpviCatalogoForms } from "@/components/taller/mpvi/admin/MpviCatalogoForms";
import { MpviUploadPlantilla } from "@/components/taller/mpvi/admin/MpviUploadPlantilla";
import { MPVI_SUBMENU_IDS } from "@/utils/constants";
import { useTallerPageGuard } from "@/modules/taller/shared/hooks/useTallerPageGuard";
import { TallerPageFrame } from "@/modules/taller/components/TallerPageFrame";
import { TALLER_COPY } from "@/modules/taller/constants";

type Tab = "plantilla" | "catalogo";

export function MpviAdminGestion() {
  const { blocked } = useTallerPageGuard(MPVI_SUBMENU_IDS.admin);
  const [tab, setTab] = useState<Tab>("plantilla");

  const tabs: { id: Tab; label: string }[] = [
    { id: "plantilla", label: "Subir archivo" },
    { id: "catalogo", label: "Cargar adicionales" },
  ];

  if (blocked) return null;

  return (
    <TallerPageFrame
      title={TALLER_COPY.mpviAdmin.title}
      description={TALLER_COPY.mpviAdmin.description}
    >
      <div className="app-tabs-scroll gap-2 border-b pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "brand-bg text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "plantilla" && <MpviUploadPlantilla />}
      {tab === "catalogo" && <MpviCatalogoForms />}
    </TallerPageFrame>
  );
}
