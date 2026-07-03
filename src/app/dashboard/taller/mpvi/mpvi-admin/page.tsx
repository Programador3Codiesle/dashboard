'use client';

import { useState } from "react";
import { MpviCatalogoForms } from "@/components/taller/mpvi/admin/MpviCatalogoForms";
import { MpviUploadPlantilla } from "@/components/taller/mpvi/admin/MpviUploadPlantilla";

type Tab = "plantilla" | "catalogo";

export default function MpviAdminPage() {
  const [tab, setTab] = useState<Tab>("plantilla");

  const tabs: { id: Tab; label: string }[] = [
    { id: "plantilla", label: "Subir archivo" },
    { id: "catalogo", label: "Cargar adicionales" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Administración MPVI</h1>
        <p className="text-gray-500 mt-1">Plantillas y catálogos del sistema MPVI</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
    </div>
  );
}
