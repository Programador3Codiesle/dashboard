'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { InformesPageFrame } from '@/modules/informes/components/InformesPageFrame';
import { INFORMES_CC_TRIMENU, INFORMES_COPY } from '@/modules/informes/constants';
import { informesKeys } from '@/modules/informes/shared/constants/query-keys';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import { INFORMES_CONTACT_CENTER_SUBMENU_ID } from '@/utils/constants';
import { informeLeadsService } from '../services/informe-leads.service';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 10;

function ymdLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function rangoMesActual(): { desde: string; hasta: string } {
  const hoy = new Date();
  return {
    desde: ymdLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
    hasta: ymdLocal(hoy),
  };
}

function fechaVisible(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  if (!anio || !mes || !dia) return iso;
  return `${dia}/${mes}/${anio}`;
}

function textoCelda(valor: string | null): string {
  return valor?.trim() ? valor : '';
}

export function InformeLeadsGestion() {
  const { blocked } = useInformesPageGuard({
    submenuId: INFORMES_CONTACT_CENTER_SUBMENU_ID,
    trimenuId: INFORMES_CC_TRIMENU.informeLeads,
    redirectTo: '/dashboard/informes/contact-center',
  });
  const { showError } = useToast();
  const inicial = rangoMesActual();
  const [desde, setDesde] = useState(inicial.desde);
  const [hasta, setHasta] = useState(inicial.hasta);
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(DEFAULT_PAGE_SIZE);
  const [descargando, setDescargando] = useState(false);
  const [consulta, setConsulta] = useState<{ desde: string; hasta: string } | null>(
    null,
  );

  const fechasListas = desde !== '' && hasta !== '' && hasta >= desde;

  const { data, isFetching, isError } = useQuery({
    queryKey: informesKeys.cc.informeLeads(
      `${consulta?.desde ?? ''}|${consulta?.hasta ?? ''}|${pagina}|${limite}`,
    ),
    queryFn: () =>
      informeLeadsService.listar({
        desde: consulta!.desde,
        hasta: consulta!.hasta,
        pagina,
        limite,
      }),
    enabled: consulta != null,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limite));

  const buscar = () => {
    if (!fechasListas) return;
    setPagina(1);
    setConsulta({ desde, hasta });
  };

  const descargarExcel = async () => {
    if (!consulta || total === 0) return;
    setDescargando(true);
    try {
      const blob = await informeLeadsService.exportarExcel(
        consulta.desde,
        consulta.hasta,
      );
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `informe-leads-${consulta.desde}-${consulta.hasta}.xlsx`;
      enlace.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showError('No se pudo descargar el Excel del informe.');
    } finally {
      setDescargando(false);
    }
  };

  if (blocked) return null;

  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  return (
    <InformesPageFrame
      title={INFORMES_COPY.informeLeads.title}
      description={INFORMES_COPY.informeLeads.description}
      backHref="/dashboard/informes/contact-center"
      backLabel={INFORMES_COPY.backCc}
    >
      <div className="w-full bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-6 shadow-lg space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="leads-desde" className="text-xs font-medium text-gray-600">
              Desde
            </label>
            <input
              id="leads-desde"
              type="date"
              className={inputClass}
              value={desde}
              max={hasta}
              onChange={(event) => {
                const valor = event.target.value;
                if (hasta && valor > hasta) return;
                setDesde(valor);
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="leads-hasta" className="text-xs font-medium text-gray-600">
              Hasta
            </label>
            <input
              id="leads-hasta"
              type="date"
              className={inputClass}
              value={hasta}
              min={desde}
              onChange={(event) => {
                const valor = event.target.value;
                if (desde && valor < desde) return;
                setHasta(valor);
              }}
            />
          </div>
          <button
            type="button"
            onClick={buscar}
            disabled={!fechasListas || isFetching}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--color-primary-dark) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetching ? <Loader2 size={16} className="animate-spin" /> : null}
            Buscar
          </button>
          <button
            type="button"
            onClick={() => void descargarExcel()}
            disabled={total === 0 || descargando}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-success) px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-success) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {descargando ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={16} />
            )}
            Descargar Excel
          </button>
        </div>
        {consulta ? (
          <p className="text-xs text-gray-500">
            {`${total} ${total === 1 ? 'registro' : 'registros'}${isFetching ? ' · actualizando…' : ''}`}
          </p>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {!consulta ? (
          <p className="text-sm text-gray-500">
            Selecciona el rango y pulsa Buscar.
          </p>
        ) : null}
        {isError ? (
          <p className="text-sm text-red-600" role="alert">
            No se pudo cargar el informe. Revisa el rango e inténtalo de nuevo.
          </p>
        ) : null}

        {consulta && isFetching && items.length === 0 && !isError ? (
          <p className="text-sm text-gray-500">Cargando información…</p>
        ) : null}

        {consulta && !isFetching && !isError && items.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay leads en el rango seleccionado.
          </p>
        ) : null}

        {items.length > 0 ? (
          <div className="app-table-scroll">
            <table className="min-w-[960px] w-full divide-y divide-gray-200 text-xs md:text-sm">
              <thead className="brand-bg border-b border-(--color-primary-dark) text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-white">Fecha registro</th>
                  <th className="px-3 py-2 text-left font-semibold text-white">Nombres</th>
                  <th className="px-3 py-2 text-left font-semibold text-white">Placa</th>
                  <th className="px-3 py-2 text-left font-semibold text-white">Teléfonos</th>
                  <th className="px-3 py-2 text-left font-semibold text-white">Email</th>
                  <th className="px-3 py-2 text-left font-semibold text-white">Campaña</th>
                  <th className="px-3 py-2 text-left font-semibold text-white">Motivo</th>
                  <th className="px-3 py-2 text-left font-semibold text-white">Id cita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((fila, index) => (
                  <tr key={`${fila.fechaRegistro}-${fila.email ?? ''}-${index}`}>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      {fechaVisible(fila.fechaRegistro)}
                    </td>
                    <td className="px-3 py-1.5">{textoCelda(fila.nombres)}</td>
                    <td className="px-3 py-1.5">{textoCelda(fila.placa)}</td>
                    <td className="px-3 py-1.5">{textoCelda(fila.telefonos)}</td>
                    <td className="px-3 py-1.5">{textoCelda(fila.email)}</td>
                    <td className="px-3 py-1.5">{textoCelda(fila.campana)}</td>
                    <td className="px-3 py-1.5">{textoCelda(fila.motivo)}</td>
                    <td className="px-3 py-1.5">{textoCelda(fila.idCita)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {total > 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2">
              <label htmlFor="leads-page-size" className="text-sm text-gray-600">
                Por página
              </label>
              <select
                id="leads-page-size"
                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
                value={limite}
                onChange={(event) => {
                  setLimite(Number(event.target.value));
                  setPagina(1);
                }}
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {totalPages > 1 ? (
              <Pagination
                currentPage={pagina}
                totalPages={totalPages}
                onChange={setPagina}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </InformesPageFrame>
  );
}
