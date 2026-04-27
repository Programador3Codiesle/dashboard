'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronRight,
  User2,
} from 'lucide-react';
import { desempenoEmpleadoService } from '@/modules/informes/gestion-humana/services/desempeno-empleado.service';

function competenciaScoreClass(value: number) {
  if (value >= 4.5) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (value >= 3.5) return 'bg-sky-50 text-sky-700 border-sky-200';
  if (value >= 2.5) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

function formatScore(value: number): string {
  return Number(value ?? 0).toFixed(2);
}

function metricPercent(value: number, max: number): number {
  const safe = Number(value ?? 0);
  const safeMax = Number(max ?? 0) > 0 ? Number(max) : 1;
  const percent = (safe / safeMax) * 100;
  return Math.max(0, Math.min(100, percent));
}

function metricBarClass(value: number, max: number): string {
  const ratio = Number(max ?? 0) > 0 ? Number(value ?? 0) / Number(max) : 0;
  if (ratio >= 0.9) return 'bg-emerald-500';
  if (ratio >= 0.75) return 'bg-sky-500';
  if (ratio >= 0.55) return 'bg-amber-500';
  return 'bg-rose-500';
}

function metricBadgeClass(value: number, max: number): string {
  const ratio = Number(max ?? 0) > 0 ? Number(value ?? 0) / Number(max) : 0;
  if (ratio >= 0.9) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (ratio >= 0.75) return 'bg-sky-50 text-sky-700 border-sky-200';
  if (ratio >= 0.55) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function DesempenoEmpleadoDetallePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const detailQuery = useQuery({
    queryKey: ['informe-desempeno-empleado-detalle', id],
    queryFn: () => desempenoEmpleadoService.obtenerDetalle(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  const detalle = detailQuery.data;
  const estadoCalificacion = detalle?.calificado === 1 ? 'Calificado' : 'No calificado';
  const estadoCalificacionClass =
    detalle?.calificado === 1
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
          <Link
            href="/dashboard/informes/gestion-humana/desempeno-empleado"
            className="hover:text-(--color-primary) transition-colors"
          >
            Informe desempeno empleado
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-700 font-medium">Detalle evaluacion</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl brand-bg-light border border-(--color-primary-light) flex items-center justify-center text-(--color-primary) font-bold">
              {getInitials(detalle?.empleado ?? 'EM')}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold brand-text tracking-tight truncate">
                {detalle?.empleado || 'Detalle de evaluacion de desempeno'}
              </h1>
              <p className="text-sm text-gray-500 truncate">
                Visualizacion completa de criterios evaluados por empleado y jefe.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {detalle && (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${estadoCalificacionClass}`}
              >
                <BadgeCheck size={14} />
                {estadoCalificacion}
              </span>
            )}
            <Link
              href="/dashboard/informes/gestion-humana/desempeno-empleado"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-(--color-primary) hover:text-(--color-primary) transition-colors"
            >
              <ArrowLeft size={16} />
              Volver al informe
            </Link>
          </div>
        </div>
      </div>

      {detailQuery.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      )}

      {detailQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            No fue posible cargar el detalle solicitado. Intenta nuevamente.
          </p>
        </div>
      )}

      {!detailQuery.isLoading && !detailQuery.isError && detalle && (
        <>
          <section className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <article className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Empleado</span>
                  <span className="font-semibold text-gray-700">
                    {formatScore(detalle.calificacionEmpleado)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${metricBarClass(
                      detalle.calificacionEmpleado,
                      1.5,
                    )}`}
                    style={{ width: `${metricPercent(detalle.calificacionEmpleado, 1.5)}%` }}
                  />
                </div>
              </article>

              <article className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Jefe</span>
                  <span className="font-semibold text-gray-700">
                    {formatScore(detalle.calificacionJefe)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${metricBarClass(
                      detalle.calificacionJefe,
                      3.5,
                    )}`}
                    style={{ width: `${metricPercent(detalle.calificacionJefe, 3.5)}%` }}
                  />
                </div>
              </article>

              <article className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Final</span>
                  <span className="font-semibold text-gray-700">
                    {formatScore(detalle.calificacionFinal)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${metricBarClass(
                      detalle.calificacionFinal,
                      5,
                    )}`}
                    style={{ width: `${metricPercent(detalle.calificacionFinal, 5)}%` }}
                  />
                </div>
              </article>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/60">
                <p className="text-xs text-gray-500 mb-1">Empleado</p>
                <p className="text-sm font-semibold text-gray-900">{detalle.empleado}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/60">
                <p className="text-xs text-gray-500 mb-1">Nit</p>
                <p className="text-sm font-semibold text-gray-900">{detalle.nitEmpleado}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/60">
                <p className="text-xs text-gray-500 mb-1">Area / Cargo</p>
                <p className="text-sm font-semibold text-gray-900">
                  {detalle.area} - {detalle.cargo}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/60">
                <p className="text-xs text-gray-500 mb-1">Sede / Fecha</p>
                <p className="text-sm font-semibold text-gray-900">
                  {detalle.sede} - {detalle.fecha}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/60">
                <p className="text-xs text-gray-500 mb-1">Jefe evaluador</p>
                <p className="text-sm font-semibold text-gray-900">{detalle.jefe}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <article className="rounded-2xl border border-gray-100 p-4 bg-white">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <User2 size={16} className="brand-text" />
                  Calificacion empleado
                </div>
                <p
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${metricBadgeClass(
                    detalle.calificacionEmpleado,
                    1.5,
                  )}`}
                >
                  {formatScore(detalle.calificacionEmpleado)}
                </p>
              </article>
              <article className="rounded-2xl border border-gray-100 p-4 bg-white">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Briefcase size={16} className="brand-text" />
                  Calificacion jefe
                </div>
                <p
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${metricBadgeClass(
                    detalle.calificacionJefe,
                    3.5,
                  )}`}
                >
                  {formatScore(detalle.calificacionJefe)}
                </p>
              </article>
              <article className="rounded-2xl border border-gray-100 p-4 bg-white">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <CalendarDays size={16} className="brand-text" />
                  Calificacion final
                </div>
                <p
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${metricBadgeClass(
                    detalle.calificacionFinal,
                    5,
                  )}`}
                >
                  {formatScore(detalle.calificacionFinal)}
                </p>
              </article>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <article className="rounded-2xl border border-gray-100 p-4 bg-gray-50/40">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="brand-text" />
                  <h2 className="text-sm font-semibold text-gray-900">
                    Necesidades de entrenamiento
                  </h2>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {detalle.capacidadesEntrenamiento || 'Sin observaciones registradas.'}
                </p>
              </article>
              <article className="rounded-2xl border border-gray-100 p-4 bg-gray-50/40">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="brand-text" />
                  <h2 className="text-sm font-semibold text-gray-900">Compromisos</h2>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {detalle.compromisos || 'Sin compromisos registrados.'}
                </p>
              </article>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 md:px-5 py-3 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Matriz de competencias</h2>
              <p className="text-xs text-gray-500">
                Comparativo por criterio entre autoevaluacion y evaluacion del jefe.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-(--color-primary) text-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Competencia</th>
                    <th className="px-3 py-2 text-center font-semibold">Empleado</th>
                    <th className="px-3 py-2 text-center font-semibold">Jefe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detalle.competencias.map((item) => (
                    <tr key={item.key} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 py-2 text-gray-800">{item.label}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${competenciaScoreClass(
                            item.empleado,
                          )}`}
                        >
                          {item.empleado}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${competenciaScoreClass(
                            item.jefe,
                          )}`}
                        >
                          {item.jefe}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
