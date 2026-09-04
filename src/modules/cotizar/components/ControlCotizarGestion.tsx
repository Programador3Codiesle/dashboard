'use client';

import { COTIZAR_CONTROL_SUBMENU_ID } from '@/utils/constants';
import { useCotizarPageGuard } from '@/modules/cotizar/shared/hooks/useCotizarPageGuard';
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { useControlRepuestos } from "@/modules/cotizador/hooks/useControlRepuestos";
import type { FilaControlRepuesto } from "@/modules/cotizador/services/cotizador-control.service";
import { PageTitleRow } from '@/components/shared/layout/PageTitleRow';

function toNum(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") return Number(v) || 0;
  return 0;
}

function sumAgendada(row: FilaControlRepuesto): number {
  return toNum(row.principal) + toNum(row.barranca) + toNum(row.rosita) + toNum(row.villa);
}

function sumDisponibles(row: FilaControlRepuesto): number {
  return (
    toNum(row.disp_principal) +
    toNum(row.disp_barranca) +
    toNum(row.disp_rosita) +
    toNum(row.disp_villa)
  );
}

function sumMin(row: FilaControlRepuesto): number {
  return (
    toNum(row.min_principal) +
    toNum(row.min_barranca) +
    toNum(row.min_rosita) +
    toNum(row.min_villa)
  );
}

function sumMax(row: FilaControlRepuesto): number {
  return (
    toNum(row.max_principal) +
    toNum(row.max_barranca) +
    toNum(row.max_rosita) +
    toNum(row.max_villa)
  );
}

// Tab 1: disponible inferior a agendada o disponible = 0
function filterTab1(rows: FilaControlRepuesto[]): FilaControlRepuesto[] {
  return rows.filter((row) => {
    const sumCant = sumAgendada(row);
    const sumDisp = sumDisponibles(row);
    return sumCant > sumDisp || sumDisp === 0;
  });
}

// Tab 2: disponible > 0, disponible > agendada, disponible < stock min
function filterTab2(rows: FilaControlRepuesto[]): FilaControlRepuesto[] {
  return rows.filter((row) => {
    const sumCant = sumAgendada(row);
    const sumDisp = sumDisponibles(row);
    const sumaMin = sumMin(row);
    return sumDisp !== 0 && sumDisp > sumCant && sumDisp < sumaMin;
  });
}

// Tab 3: disponible > 0, disponible > agendada, disponible > stock min
function filterTab3(rows: FilaControlRepuesto[]): FilaControlRepuesto[] {
  return rows.filter((row) => {
    const sumCant = sumAgendada(row);
    const sumDisp = sumDisponibles(row);
    const sumaMin = sumMin(row);
    return sumDisp !== 0 && sumDisp > sumCant && sumDisp > sumaMin;
  });
}

const TAB_OPTIONS = [
  {
    id: "tab1",
    label: "Disponible es inferior a agendada",
    shortLabel: "Inf. agendada",
    icon: AlertTriangle,
    bgHeader: "bg-red-100",
    borderColor: "border-red-200",
  },
  {
    id: "tab2",
    label: "Disponible inferior al stock min",
    shortLabel: "Inf. stock min",
    icon: TrendingDown,
    bgHeader: "bg-amber-100",
    borderColor: "border-amber-200",
  },
  {
    id: "tab3",
    label: "Disponible es superior al stock min",
    shortLabel: "Sup. stock min",
    icon: TrendingUp,
    bgHeader: "brand-bg-light",
    borderColor: "brand-border",
  },
];

function TablaControl({
  filas,
  bgHeader,
}: {
  filas: FilaControlRepuesto[];
  bgHeader: string;
}) {
  return (
    <div className="app-table-scroll">
      <table className="w-full min-w-[1100px] text-sm text-left border-collapse">
        <thead>
          <tr className={`${bgHeader} border-b border-gray-200`}>
            <th
              colSpan={13}
              className="px-4 py-2 text-center font-semibold text-gray-800"
            >
              Total: {filas.length} registro(s)
            </th>
          </tr>
          <tr className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
            <th rowSpan={2} className="px-4 py-3 font-medium border-b border-r border-gray-200">
              Referencia
            </th>
            <th colSpan={2} className="px-4 py-2 text-center border-b border-r border-gray-200">
              Principal
            </th>
            <th colSpan={2} className="px-4 py-2 text-center border-b border-r border-gray-200">
              Barrancabermeja
            </th>
            <th colSpan={2} className="px-4 py-2 text-center border-b border-r border-gray-200">
              Rosita
            </th>
            <th colSpan={2} className="px-4 py-2 text-center border-b border-r border-gray-200">
              Cúcuta
            </th>
            <th colSpan={4} className="px-4 py-2 text-center border-b border-gray-200">
              Totales
            </th>
          </tr>
          <tr className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Cantidad</th>
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Und</th>
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Cantidad</th>
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Und</th>
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Cantidad</th>
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Und</th>
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Cantidad</th>
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Und</th>
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Cantidad</th>
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Disponibles</th>
            <th className="px-4 py-2 text-center border-b border-r border-gray-200">Stock min</th>
            <th className="px-4 py-2 text-center border-b border-gray-200">Stock max</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filas.length === 0 ? (
            <tr>
              <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                No hay registros en este criterio.
              </td>
            </tr>
          ) : (
            filas.map((row, idx) => {
              const sumCant = sumAgendada(row);
              const sumDisp = sumDisponibles(row);
              const sumaMin = sumMin(row);
              const sumaMax = sumMax(row);
              return (
                <tr
                  key={`${row.codigo}-${idx}`}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  <td className="px-4 py-2 font-mono text-gray-800 border-r border-gray-100">
                    {row.codigo}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-800">{toNum(row.principal)}</td>
                  <td className="px-4 py-2 text-center text-gray-700">{toNum(row.disp_principal)}</td>
                  <td className="px-4 py-2 text-center text-gray-800">{toNum(row.barranca)}</td>
                  <td className="px-4 py-2 text-center text-gray-700">{toNum(row.disp_barranca)}</td>
                  <td className="px-4 py-2 text-center text-gray-800">{toNum(row.rosita)}</td>
                  <td className="px-4 py-2 text-center text-gray-700">{toNum(row.disp_rosita)}</td>
                  <td className="px-4 py-2 text-center text-gray-800">{toNum(row.villa)}</td>
                  <td className="px-4 py-2 text-center text-gray-700">{toNum(row.disp_villa)}</td>
                  <td className="px-4 py-2 text-center font-medium text-gray-800">{sumCant}</td>
                  <td className="px-4 py-2 text-center text-gray-700">{sumDisp}</td>
                  <td className="px-4 py-2 text-center text-gray-700">{sumaMin}</td>
                  <td className="px-4 py-2 text-center text-gray-700">{sumaMax}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ControlCotizarGestion() {
  const { blocked } = useCotizarPageGuard(COTIZAR_CONTROL_SUBMENU_ID);
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3">("tab1");
  const { filas, loading, error } = useControlRepuestos();

  const { tab1Rows, tab2Rows, tab3Rows } = useMemo(() => {
    return {
      tab1Rows: filterTab1(filas),
      tab2Rows: filterTab2(filas),
      tab3Rows: filterTab3(filas),
    };
  }, [filas]);

  const currentTabOption = TAB_OPTIONS.find((t) => t.id === activeTab)!;
  const currentRows =
    activeTab === "tab1" ? tab1Rows : activeTab === "tab2" ? tab2Rows : tab3Rows;

  if (blocked) return null;

  return (
    <div className="space-y-6">
      <PageTitleRow
        title="Control repuestos"
        description="Control de repuestos por cotización y citas: disponible vs agendada y stock min/max por bodega."
      />

      {error && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="border-b border-gray-200">
          <nav className="app-tabs-scroll" aria-label="Tabs">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "tab1" | "tab2" | "tab3")}
                title={tab.label}
                className={`
                  shrink-0 sm:flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? "border-(--color-primary) text-(--color-primary) bg-gray-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                  }
                `}
              >
                <tab.icon size={18} className="shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">
                  <span className="lg:hidden">{tab.shortLabel}</span>
                  <span className="hidden lg:inline">{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              Cargando control de repuestos...
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <TablaControl
                  filas={currentRows}
                  bgHeader={currentTabOption.bgHeader}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
