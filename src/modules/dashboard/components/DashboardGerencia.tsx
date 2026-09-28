"use client";

import { ChevronRight } from "lucide-react";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";
import type {
  DashboardGerencia as DashboardGerenciaType,
  InformePosventaSede,
  InformePosventaTaller,
} from "../types";
import { formatCurrency } from "../utils/format-currency";
import { DashboardFechaBadge } from "./DashboardFechaBadge";

function dinero(value: number): string {
  return `$${formatCurrency(Math.round(value))}`;
}

function Porcentaje({
  valor,
  cumplida,
  sobreMarca = false,
}: {
  valor: number;
  cumplida: boolean;
  sobreMarca?: boolean;
}) {
  const tono = sobreMarca
    ? cumplida
      ? "bg-white/20 text-white"
      : "bg-white/15 text-white"
    : cumplida
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-red-50 text-red-700 border border-red-200";
  return (
    <span
      className={`inline-flex min-w-14 justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tono}`}
    >
      {valor}%
    </span>
  );
}

function Cifras({
  presupuesto,
  total,
  porcentaje,
  metaCumplida,
  sobreMarca = false,
}: {
  presupuesto: number;
  total: number;
  porcentaje: number;
  metaCumplida: boolean;
  sobreMarca?: boolean;
}) {
  const texto = sobreMarca ? "text-white/90" : "text-gray-600";
  const valor = sobreMarca ? "text-white" : "text-gray-900";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 md:contents">
      <span className={`text-xs md:text-sm tabular-nums ${texto}`}>
        <span className="md:hidden">Meta </span>
        <span className={`font-medium ${valor}`}>{dinero(presupuesto)}</span>
      </span>
      <span className={`text-xs md:text-sm tabular-nums ${texto}`}>
        <span className="md:hidden">Vendido </span>
        <span className={`font-medium ${valor}`}>{dinero(total)}</span>
      </span>
      <Porcentaje
        valor={porcentaje}
        cumplida={metaCumplida}
        sobreMarca={sobreMarca}
      />
    </div>
  );
}

const FILA =
  "grid grid-cols-1 items-center gap-2 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_9rem_9rem_4.5rem] md:gap-3";

function DesgloseTaller({ taller }: { taller: InformePosventaTaller }) {
  if (taller.mo == null && taller.tot == null && taller.rep == null) {
    return null;
  }
  const partes = [
    { etiqueta: "MO", valor: taller.mo },
    { etiqueta: "TOT", valor: taller.tot },
    { etiqueta: "REP", valor: taller.rep },
  ];
  return (
    <div className="flex flex-wrap gap-2 px-3 pb-2.5 pl-10 md:pl-14">
      {partes.map((parte) => (
        <span
          key={parte.etiqueta}
          className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
        >
          {parte.etiqueta}:{" "}
          <span className="font-medium text-gray-900 tabular-nums">
            {dinero(parte.valor ?? 0)}
          </span>
        </span>
      ))}
    </div>
  );
}

function FilaTaller({ taller }: { taller: InformePosventaTaller }) {
  const abre = taller.mo != null || taller.tot != null || taller.rep != null;
  const cifras = (
    <Cifras
      presupuesto={taller.presupuesto}
      total={taller.total}
      porcentaje={taller.porcentaje}
      metaCumplida={taller.metaCumplida}
    />
  );
  if (!abre) {
    return (
      <div className={`${FILA} border-t border-gray-100 bg-gray-50/80`}>
        <span className="min-w-0 pl-6 text-sm text-gray-800 md:pl-10">
          {taller.nombre}
        </span>
        {cifras}
      </div>
    );
  }
  return (
    <details className="group border-t border-gray-100 bg-gray-50/80">
      <summary
        className={`${FILA} cursor-pointer list-none hover:bg-gray-100/80 focus-visible:brand-focus-ring [&::-webkit-details-marker]:hidden`}
      >
        <span className="flex min-w-0 items-center gap-1.5 pl-6 text-sm text-gray-800 md:pl-10">
          <ChevronRight
            aria-hidden="true"
            className="size-3.5 shrink-0 text-gray-400 motion-safe:transition-transform group-open:rotate-90"
          />
          <span className="min-w-0">{taller.nombre}</span>
        </span>
        {cifras}
      </summary>
      <DesgloseTaller taller={taller} />
    </details>
  );
}

function FilaSede({ sede }: { sede: InformePosventaSede }) {
  const talleres = sede.talleres ?? [];
  const cifras = (
    <Cifras
      presupuesto={sede.presupuesto}
      total={sede.total}
      porcentaje={sede.porcentaje}
      metaCumplida={sede.metaCumplida}
    />
  );
  if (talleres.length === 0) {
    return (
      <div className={`${FILA} border-t border-gray-100`}>
        <span className="min-w-0 pl-3 text-sm font-medium text-gray-900 md:pl-6">
          {sede.nombre}
        </span>
        {cifras}
      </div>
    );
  }
  return (
    <details className="group border-t border-gray-100">
      <summary
        className={`${FILA} cursor-pointer list-none hover:brand-bg-light focus-visible:brand-focus-ring [&::-webkit-details-marker]:hidden`}
      >
        <span className="flex min-w-0 items-center gap-1.5 pl-3 text-sm font-medium text-gray-900 md:pl-6">
          <ChevronRight
            aria-hidden="true"
            className="size-3.5 shrink-0 brand-text motion-safe:transition-transform group-open:rotate-90"
          />
          <span className="min-w-0">{sede.nombre}</span>
        </span>
        {cifras}
      </summary>
      {talleres.map((taller) => (
        <FilaTaller key={taller.nombre} taller={taller} />
      ))}
    </details>
  );
}

export function DashboardGerencia({ data }: { data: DashboardGerenciaType }) {
  const informe = data.informe_posventa;
  return (
    <div className="space-y-6">
      <PageTitleRow
        title="Informe Posventa actual"
        description="Meta, vendido y porcentaje del mes. Abre cada sede para ver el taller."
        headingAs="h2"
        headingClassName="text-xl font-bold text-gray-900"
      />
      <DashboardFechaBadge fecha={data.fecha_actual} diaFestivo={data.dia_festivo} />

      {!informe ? (
        <p className="rounded-xl border border-gray-100 bg-white px-4 py-6 text-sm text-gray-500">
          No hay informe de posventa para la empresa seleccionada.
        </p>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div
            className={`${FILA} hidden border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid`}
          >
            <span>Sede</span>
            <span>Meta a cumplir</span>
            <span>Total vendido</span>
            <span>%</span>
          </div>
          <details className="group" open>
            <summary
              className={`${FILA} cursor-pointer list-none brand-bg text-white hover:opacity-95 focus-visible:brand-focus-ring [&::-webkit-details-marker]:hidden`}
            >
              <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 motion-safe:transition-transform group-open:rotate-90"
                />
                <span className="min-w-0">{informe.general.nombre}</span>
              </span>
              <Cifras
                presupuesto={informe.general.presupuesto}
                total={informe.general.total}
                porcentaje={informe.general.porcentaje}
                metaCumplida={informe.general.metaCumplida}
                sobreMarca
              />
            </summary>
            {informe.sedes.map((sede) => (
              <FilaSede key={sede.nombre} sede={sede} />
            ))}
          </details>
        </section>
      )}
    </div>
  );
}
