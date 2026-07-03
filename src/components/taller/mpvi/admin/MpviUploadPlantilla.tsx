"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/shared/atoms/Button";
import { useMpviAdminActions } from "@/modules/taller/mpvi/hooks/useMpviAdmin";

export function MpviUploadPlantilla() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const { subirPlantilla } = useMpviAdminActions();

  const handleSubmit = () => {
    if (!archivo) return;
    subirPlantilla.mutate(archivo, {
      onSuccess: () => {
        setArchivo(null);
        if (inputRef.current) inputRef.current.value = "";
      },
    });
  };

  return (
    <div className="brand-card-surface rounded-2xl border brand-border-active brand-card-elevated p-4 sm:p-6 transition-all">
      <h3 className="text-lg font-semibold mb-2 brand-section-title">Subir plantilla MPVI</h3>
      <p className="text-sm text-gray-600 mb-4">
        Seleccione el archivo Excel con la plantilla MPVI para cargar los datos al sistema.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1 w-full">
          <label htmlFor="archivo-mpvi" className="block text-sm font-medium text-gray-700 mb-1">
            Archivo Excel
          </label>
          <input
            ref={inputRef}
            id="archivo-mpvi"
            type="file"
            accept=".xlsx,.xls"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-amber-400 focus:outline-none"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button
          className="brand-btn flex items-center gap-2"
          disabled={!archivo || subirPlantilla.isPending}
          onClick={handleSubmit}
        >
          <Upload size={18} />
          {subirPlantilla.isPending ? "Subiendo..." : "Subir"}
        </Button>
      </div>
    </div>
  );
}
