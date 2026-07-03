"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/shared/atoms/Button";
import { useMpviAdminActions } from "@/modules/taller/mpvi/hooks/useMpviAdmin";
import type { MpviTablaAuxiliar } from "@/modules/taller/mpvi/types";

const TABLAS: { value: MpviTablaAuxiliar; label: string }[] = [
  { value: 0, label: "Maestro GMICA" },
  { value: 1, label: "Repuestos GM" },
  { value: 2, label: "Reemplazo Repuestos" },
];

export function MpviUploadTablasAux() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [tabla, setTabla] = useState<MpviTablaAuxiliar>(0);
  const { subirTablasAux } = useMpviAdminActions();

  const handleSubmit = () => {
    if (!archivo) return;
    subirTablasAux.mutate(
      { archivo, tabla },
      {
        onSuccess: () => {
          setArchivo(null);
          if (inputRef.current) inputRef.current.value = "";
        },
      },
    );
  };

  return (
    <div className="brand-card-surface rounded-2xl border brand-border-active brand-card-elevated p-4 sm:p-6 transition-all">
      <h3 className="text-lg font-semibold mb-2 brand-section-title">Cargar tablas auxiliares</h3>
      <p className="text-sm text-gray-600 mb-4">
        Suba archivos para actualizar maestros GMICA, repuestos GM o reemplazos.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="tabla-aux" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de tabla
          </label>
          <select
            id="tabla-aux"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-amber-400 focus:outline-none"
            value={tabla}
            onChange={(e) => setTabla(Number(e.target.value) as MpviTablaAuxiliar)}
          >
            {TABLAS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="archivo-tabla" className="block text-sm font-medium text-gray-700 mb-1">
            Archivo
          </label>
          <input
            ref={inputRef}
            id="archivo-tabla"
            type="file"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-amber-400 focus:outline-none"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button
          className="brand-btn flex items-center justify-center gap-2"
          disabled={!archivo || subirTablasAux.isPending}
          onClick={handleSubmit}
        >
          <Upload size={18} />
          {subirTablasAux.isPending ? "Subiendo..." : "Subir"}
        </Button>
      </div>
    </div>
  );
}
