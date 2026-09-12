"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TallerPageFrame } from "@/modules/taller/components/TallerPageFrame";
import { TALLER_COPY } from "@/modules/taller/constants";
import { useTallerPageGuard } from "@/modules/taller/shared/hooks/useTallerPageGuard";
import { getErrorMessage } from "@/modules/taller/shared/utils/get-error-message";
import { getXlsx } from "@/utils/export-xlsx";
import {
  CODIESEL_EMPRESA_ID,
  RANKING_TECNICOS_TRIMESTRAL_SUBMENU_ID,
} from "@/utils/constants";
import { useRankingTrimestral } from "../hooks/useRankingTrimestral";

const MES_NOMBRES = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const TRIMESTRES: { id: 1 | 2 | 3 | 4; label: string }[] = [
  { id: 1, label: "1 (Ene–Mar)" },
  { id: 2, label: "2 (Abr–Jun)" },
  { id: 3, label: "3 (Jul–Sep)" },
  { id: 4, label: "4 (Oct–Dic)" },
];

function currency(value: number): string {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function yearsFromPhp(): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = 2021; y <= current; y += 1) years.push(y);
  return years;
}

export function RankingTrimestralGestion() {
  const { blocked } = useTallerPageGuard(
    RANKING_TECNICOS_TRIMESTRAL_SUBMENU_ID,
    CODIESEL_EMPRESA_ID,
  );
  const { showError } = useToast();
  const [ano, setAno] = useState(2021);
  const [trimestre, setTrimestre] = useState<1 | 2 | 3 | 4>(4);
  const [loadingExport, setLoadingExport] = useState(false);

  const query = useRankingTrimestral(ano, trimestre, !blocked);
  const filas = query.data?.filas ?? [];
  const meses = query.data?.meses ?? [10, 11, 12];
  const years = useMemo(() => yearsFromPhp(), []);

  const handleExportar = async () => {
    if (filas.length === 0) return;
    setLoadingExport(true);
    try {
      const rows = filas.map((f) => ({
        Técnico: f.tecnico,
        [MES_NOMBRES[meses[0]] ?? "Mes 1"]: f.mes1,
        [MES_NOMBRES[meses[1]] ?? "Mes 2"]: f.mes2,
        [MES_NOMBRES[meses[2]] ?? "Mes 3"]: f.mes3,
        Total: f.total,
      }));
      const XLSX = await getXlsx();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ranking trimestral");
      XLSX.writeFile(workbook, `Ranking-tecnicos-T${trimestre}-${ano}.xlsx`);
    } catch {
      showError("No se pudo exportar el ranking");
    } finally {
      setLoadingExport(false);
    }
  };

  if (blocked) return null;

  return (
    <TallerPageFrame
      title={TALLER_COPY.rankingTrimestral.title}
      description={TALLER_COPY.rankingTrimestral.description}
    >
      <div className="space-y-4">
        <div className="bg-white brand-card-elevated rounded-2xl border brand-border-active p-4 sm:p-5">
          <div className="app-filter-grid">
            <div className="min-w-0">
              <label htmlFor="ranking-ano" className="block text-xs font-semibold text-gray-600 mb-1">
                Año
              </label>
              <select
                id="ranking-ano"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label
                htmlFor="ranking-trimestre"
                className="block text-xs font-semibold text-gray-600 mb-1"
              >
                Trimestre
              </label>
              <select
                id="ranking-trimestre"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                value={trimestre}
                onChange={(e) => setTrimestre(Number(e.target.value) as 1 | 2 | 3 | 4)}
              >
                {TRIMESTRES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => void handleExportar()}
              disabled={loadingExport || query.isLoading || filas.length === 0}
              className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                filas.length > 0
                  ? "bg-(--color-success) text-white hover:opacity-90"
                  : "border border-gray-300 text-gray-700 bg-white"
              }`}
            >
              {loadingExport && <Loader2 size={16} className="animate-spin" />}
              <FileSpreadsheet size={16} />
              <span>Exportar a Excel</span>
            </button>
          </div>
        </div>

        <div className="bg-white brand-card-elevated rounded-2xl border brand-border-active overflow-hidden">
          {query.isLoading ? (
            <p className="px-4 py-6 text-sm text-gray-500">Cargando ranking...</p>
          ) : query.isError ? (
            <p className="px-4 py-6 text-sm text-red-600">
              {getErrorMessage(query.error, TALLER_COPY.rankingTrimestral.title)}
            </p>
          ) : (
            <div data-testid="ranking-trimestral-table" className="app-table-scroll">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="brand-bg text-white">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold">Técnico</th>
                    <th className="px-3 py-2.5 text-right font-semibold">
                      {MES_NOMBRES[meses[0]]}
                    </th>
                    <th className="px-3 py-2.5 text-right font-semibold">
                      {MES_NOMBRES[meses[1]]}
                    </th>
                    <th className="px-3 py-2.5 text-right font-semibold">
                      {MES_NOMBRES[meses[2]]}
                    </th>
                    <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                        No hay ventas en el trimestre seleccionado.
                      </td>
                    </tr>
                  ) : (
                    filas.map((f) => (
                      <tr key={f.operario || f.tecnico} className="border-b border-gray-50">
                        <td className="px-3 py-2 font-medium">{f.tecnico || "—"}</td>
                        <td className="px-3 py-2 text-right">{currency(f.mes1)}</td>
                        <td className="px-3 py-2 text-right">{currency(f.mes2)}</td>
                        <td className="px-3 py-2 text-right">{currency(f.mes3)}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {currency(f.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TallerPageFrame>
  );
}
