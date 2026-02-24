"use client";

import { memo, useCallback, useState } from "react";
import type { DashboardJefeTaller as DashboardJefeTallerType } from "../types";
import type { DataPoint, JefeTallerSedeItem } from "../types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/* type BodegaRow = DashboardJefeTallerType["data_bodegas"][number];

const DashboardBodegaRow = memo(function DashboardBodegaRow({
  tecnico,
  numero_orden,
  cliente,
  rptos,
  MO,
}: BodegaRow) {
  return (
    <tr>
      <td className="px-4 py-2 text-sm text-gray-900">{tecnico}</td>
      <td className="px-4 py-2 text-sm text-gray-900">{numero_orden}</td>
      <td className="px-4 py-2 text-sm text-gray-900">{cliente}</td>
      <td className="px-4 py-2 text-sm text-right">{formatCurrency(rptos)}</td>
      <td className="px-4 py-2 text-sm text-right">{formatCurrency(MO)}</td>
    </tr>
  );
});

*/

function maxY(points: DataPoint[]): number {
  if (points.length === 0) return 1;
  const m = Math.max(...points.map((p) => p.y));
  return m > 0 ? m : 1;
}

const ChartBarSimple = memo(function ChartBarSimple({
  title,
  dataPoints,
  metaPoints,
  formatValue = (v: number) => String(v),
  metaLabel = "Meta",
}: {
  title: string;
  dataPoints: DataPoint[];
  metaPoints?: DataPoint[];
  formatValue?: (v: number) => string;
  metaLabel?: string;
}) {
  const maxVal = Math.max(maxY(dataPoints), ...(metaPoints?.map((p) => p.y) ?? [0]));
  const metaVal = metaPoints?.[0]?.y;
  return (
    <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      <div className="space-y-2">
        {dataPoints.map((dp, i) => {
          const cumpleMeta = metaVal != null && dp.y >= metaVal;
          const tieneMeta = metaVal != null;
          const barColor = tieneMeta
            ? cumpleMeta
              ? "bg-emerald-500"
              : "bg-red-400"
            : "bg-[var(--color-primary)]";
          const textColor = tieneMeta
            ? cumpleMeta
              ? "text-emerald-600 font-medium"
              : "text-red-600"
            : "text-gray-500";
          return (
            <div key={`${dp.label}-${i}`} className="flex items-center gap-2">
              <span className="w-16 text-xs text-gray-600 truncate">
                {dp.label}
              </span>
              <div className="flex-1 flex items-center gap-1">
                <div
                  className={`h-6 rounded min-w-[2px] transition-all ${barColor}`}
                  style={{
                    width: `${Math.min(100, (dp.y / maxVal) * 100)}%`,
                  }}
                  title={formatValue(dp.y)}
                />
                <span className={`text-xs w-16 text-right ${textColor}`} title={tieneMeta ? (cumpleMeta ? "Cumple meta" : "No cumple meta") : undefined}>
                  {formatValue(dp.y)}
                  {tieneMeta && (
                    <span className="ml-0.5" aria-hidden>
                      {cumpleMeta ? "✓" : "✗"}
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
        {metaVal != null && (
          <p className="text-xs text-red-600 pt-1 border-t border-gray-100">
            {metaLabel}: {formatValue(metaVal)}
          </p>
        )}
      </div>
    </div>
  );
});

const ChartTotalVendido = memo(function ChartTotalVendido({
  dataPoints1,
  dataPoints2,
  dataPoints3,
  dataPoints4,
}: {
  dataPoints1: DataPoint[];
  dataPoints2: DataPoint[];
  dataPoints3: DataPoint[];
  dataPoints4: DataPoint[];
}) {
  const maxVal = maxY(dataPoints4);
  return (
    <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Gráfica Total Vendido
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" aria-hidden />
            M.O
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-cyan-400 shrink-0" aria-hidden />
            Rptos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-purple-400 shrink-0" aria-hidden />
            TOT
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {dataPoints4.map((dp, i) => {
          const mo = dataPoints1[i]?.y ?? 0;
          const rptos = dataPoints2[i]?.y ?? 0;
          const tot = dataPoints3[i]?.y ?? 0;
          return (
            <div key={`${dp.label}-${i}`} className="flex items-center gap-2">
              <span className="w-16 text-xs text-gray-600 truncate">
                {dp.label}
              </span>
              <div className="flex-1 flex items-center gap-0.5">
                {mo > 0 && (
                  <div
                    className="h-6 bg-amber-500 rounded-l min-w-[2px]"
                    style={{
                      width: `${(mo / maxVal) * 50}%`,
                    }}
                    title={`M.O: ${formatCurrency(mo)}`}
                  />
                )}
                {rptos > 0 && (
                  <div
                    className="h-6 bg-cyan-400 min-w-[2px]"
                    style={{
                      width: `${(rptos / maxVal) * 50}%`,
                    }}
                    title={`Rptos: ${formatCurrency(rptos)}`}
                  />
                )}
                {tot > 0 && (
                  <div
                    className="h-6 bg-purple-400 rounded-r min-w-[2px]"
                    style={{
                      width: `${(tot / maxVal) * 50}%`,
                    }}
                    title={`TOT: ${formatCurrency(tot)}`}
                  />
                )}
                <span className="text-xs text-gray-500 w-20 text-right ml-1">
                  {formatCurrency(dp.y)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const SedeCards = memo(function SedeCards({ sede }: { sede: JefeTallerSedeItem }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">Total Vendido</p>
        <p className="text-2xl font-bold text-gray-900">
          ${formatCurrency(sede.totalVenta)}
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">Total M.O</p>
        <p className="text-2xl font-bold text-gray-900">
          ${formatCurrency(sede.totalVentaManoObra)}
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">Total TOT</p>
        <p className="text-2xl font-bold text-gray-900">
          ${formatCurrency(sede.totalVentaTot)}
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">Total Rptos</p>
        <p className="text-2xl font-bold text-gray-900">
          ${formatCurrency(sede.totalVentaRepuesto)}
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">Horas Facturadas</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(sede.totalHoras)}
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">NPS Interno</p>
        <p className="text-2xl font-bold text-gray-900">
          {Math.round(sede.objectiveNpsIntCurrent)}%
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">NPS COLMOTORES</p>
        <p className="text-2xl font-bold text-gray-900">
          {Math.round(sede.objectiveNpsGMIntCurrent)}%
        </p>
      </div>
    </div>
  );
});

const SedeCharts = memo(function SedeCharts({ sede }: { sede: JefeTallerSedeItem }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartTotalVendido
        dataPoints1={sede.dataPoints1}
        dataPoints2={sede.dataPoints2}
        dataPoints3={sede.dataPoints3}
        dataPoints4={sede.dataPoints4}
      />
      <ChartBarSimple
        title="Horas Facturadas"
        dataPoints={sede.dataPoints5}
        formatValue={(v) => formatCurrency(v)}
      />
      <ChartBarSimple
        title="NPS Interno"
        dataPoints={sede.dataPoints6}
        metaPoints={sede.objetiveNps}
        metaLabel="Meta"
        formatValue={(v) => Number(v).toFixed(1)}
      />
      <ChartBarSimple
        title="NPS GM"
        dataPoints={sede.dataPoints7}
        metaPoints={sede.objetiveNpsGM}
        metaLabel="Meta"
        formatValue={(v) => Number(v).toFixed(1)}
      />
    </div>
  );
});

function SedePanel({
  sede,
  isActive,
}: {
  sede: JefeTallerSedeItem;
  isActive: boolean;
}) {
  if (!isActive) return null;
  return (
    <div className="space-y-6 pt-2">
      <SedeCards sede={sede} />
      <SedeCharts sede={sede} />
    </div>
  );
}

function DashboardJefeTallerInner({ data }: { data: DashboardJefeTallerType }) {
  const [activeTab, setActiveTab] = useState(0);
  const hasSedes = data.sedes && data.sedes.length > 0;

  const onTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  if (hasSedes) {
    const sedes = data.sedes!;
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Informe diario Taller por sede
        </h2>
        <div className="border-b border-gray-200">
          <nav className="flex gap-1" role="tablist">
            {sedes.map((sede, index) => (
              <button
                key={sede.sede}
                type="button"
                role="tab"
                aria-selected={activeTab === index}
                onClick={() => onTabChange(index)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
                  activeTab === index
                    ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]"
                    : "border-transparent text-gray-600 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                }`}
              >
                {sede.sede}
              </button>
            ))}
          </nav>
        </div>
        {sedes.map((sede, index) => (
          <SedePanel
            key={sede.sede}
            sede={sede}
            isActive={activeTab === index}
          />
        ))}

        {/* 
        {data.data_bodegas.length > 0 && (
          <div className="bg-white rounded-xl overflow-hidden shadow border border-gray-100">
            <h3 className="text-lg font-semibold p-4 border-b">
              Detalle por bodega (todas las sedes)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Técnico
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Orden
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Rptos
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      M.O
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.data_bodegas.map((row) => (
                    <DashboardBodegaRow
                      key={`${row.numero_orden}-${row.operario}`}
                      {...row}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

         */ }

      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Informe diario Taller</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total Vendido</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.total_ventas)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total M.O</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.mo)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total TOT</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.tot)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total Rptos</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.rep)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Horas Facturadas</p>
          <p className="text-2xl font-bold text-gray-900">{data.horas_fac}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">NPS Interno</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(data.nps_int)}%
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">NPS Colmotores</p>
        <p className="text-2xl font-bold text-gray-900">
          {Math.round(data.nps_col)}%
        </p>
      </div>

      {/* 
      {data.data_bodegas.length > 0 && (
        <div className="bg-white rounded-xl overflow-hidden shadow border border-gray-100">
          <h3 className="text-lg font-semibold p-4 border-b">
            Detalle por bodega
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Técnico
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Orden
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Rptos
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    M.O
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.data_bodegas.map((row) => (
                  <DashboardBodegaRow
                    key={`${row.numero_orden}-${row.operario}`}
                    {...row}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      */ }
    </div>
  );
}

export const DashboardJefeTaller = memo(DashboardJefeTallerInner);
