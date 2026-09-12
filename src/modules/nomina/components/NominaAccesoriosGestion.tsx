'use client';

import { NOMINA_ACCESORIOS_SUBMENU_ID } from '@/utils/constants';
import { useNominaPageGuard } from '@/modules/nomina/shared/hooks/useNominaPageGuard';
import {
  formatMoneyEs,
  formatNumberEs,
  getApiErrorMessage,
} from '@/modules/nomina/utils/format-currency';
import { NOMINA_STYLES } from '@/modules/nomina/constants';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileSpreadsheet, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EmpresaBadge } from '@/components/shared/brand/EmpresaBadge';
import {
  NominaAccesoriosResultado,
  TipoInformeNominaAccesorios,
  nominaAccesoriosService,
} from '@/modules/nomina/services/nomina-accesorios.service';

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const TIPOS: Array<{ value: TipoInformeNominaAccesorios; label: string }> = [
  { value: 1, label: 'Auxiliar' },
  { value: 2, label: 'Asesor Comercial' },
  { value: 3, label: 'Tecnico' },
  { value: 4, label: 'Otras marcas' },
  { value: 5, label: 'Mano obra interna' },
];

const EXCEL_PERFIL: Record<TipoInformeNominaAccesorios, string> = {
  1: 'Auxiliar',
  2: 'Asesor',
  3: 'Tecnico',
  4: 'Otras_marcas',
  5: 'Mano_obra_interna',
};

function yearsForSelect(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => current - index);
}

function toEnteroExcel(value: number | string | null): string | number {
  if (value == null) return '';
  if (value === 'N/A') return 'N/A';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return Math.round(n);
}

export function NominaAccesoriosGestion() {
  const { blocked } = useNominaPageGuard(NOMINA_ACCESORIOS_SUBMENU_ID);
  const { showError } = useToast();
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState('');
  const [perfil, setPerfil] = useState<'' | TipoInformeNominaAccesorios>('');
  const [resultado, setResultado] = useState<NominaAccesoriosResultado | null>(
    null,
  );

  const listarMutation = useMutation({
    mutationFn: (params: {
      ano: number;
      mes: number;
      perfil: TipoInformeNominaAccesorios;
    }) => nominaAccesoriosService.listar(params),
    onSuccess: setResultado,
    onError: (error: unknown) => {
      showError(
        getApiErrorMessage(error, 'No se pudo cargar la nómina de accesorios.'),
      );
    },
  });

  const onGenerar = () => {
    const mesNum = Number(mes);
    if (!ano || !mesNum) {
      showError('Seleccione el año y el mes.');
      return;
    }
    if (!perfil) {
      showError('Seleccione un perfil.');
      return;
    }
    listarMutation.mutate({ ano, mes: mesNum, perfil });
  };

  const rowsCount = useMemo(() => {
    if (!resultado) return 0;
    switch (resultado.tipo) {
      case 1:
        return resultado.auxiliar.length;
      case 2:
        return resultado.asesor.length;
      case 3:
        return resultado.tecnicos.length;
      case 4:
        return resultado.otrasMarcas.length;
      case 5:
        return resultado.moInterna.length;
      default:
        return 0;
    }
  }, [resultado]);

  const onExportExcel = async () => {
    if (!resultado || rowsCount === 0) {
      showError('No hay información para exportar.');
      return;
    }
    const XLSX = await import('xlsx');
    let sheetRows: Array<Record<string, string | number>> = [];
    if (resultado.tipo === 1) {
      sheetRows = resultado.auxiliar.map((row) => ({
        Fecha: row.fecha,
        Nombres: row.nombres,
        'Venta propia': toEnteroExcel(row.ventaPropia),
        'Venta compartida': toEnteroExcel(row.ventaCompartida),
        'Comisión propia': toEnteroExcel(row.comisionPropia),
        'Comisión compartida': toEnteroExcel(row.comisionCompartida),
        'Total comisión': toEnteroExcel(row.totalComision),
      }));
    } else if (resultado.tipo === 2) {
      sheetRows = resultado.asesor.map((row) => ({
        Fecha: row.fecha,
        Documento: row.documento,
        Nombres: row.nombres,
        'Venta propia': toEnteroExcel(row.ventaPropia),
        'Venta compartida': toEnteroExcel(row.ventaCompartida),
        'VH entregados': toEnteroExcel(row.vhEntregados),
        'Comisión propia': toEnteroExcel(row.comisionPropia),
        'Comisión compartida': toEnteroExcel(row.comisionCompartida),
        'Total comisión': toEnteroExcel(row.totalComision),
        'Share accesorios':
          row.shareAccesorios == null
            ? 'N/A'
            : toEnteroExcel(row.shareAccesorios),
      }));
    } else if (resultado.tipo === 3) {
      sheetRows = resultado.tecnicos.map((row) => ({
        Fecha: row.fecha,
        Nombres: row.nombres,
        'Total horas': toEnteroExcel(row.totalHoras),
        Comisión: toEnteroExcel(row.comision),
      }));
    } else if (resultado.tipo === 4) {
      sheetRows = resultado.otrasMarcas.map((row) => ({
        Fecha: row.fecha,
        Nombres: row.vendedor,
        'Venta accesorios': toEnteroExcel(row.ventaAccesorios),
        Comisión: toEnteroExcel(row.comision),
      }));
    } else {
      sheetRows = resultado.moInterna.map((row) => ({
        Fecha: row.fecha,
        Agencia: row.agencia,
        Tiempo: toEnteroExcel(row.tiempo),
        Total: toEnteroExcel(row.total),
      }));
    }

    const ws = XLSX.utils.json_to_sheet(sheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nomina Accesorios');
    const mesLabel =
      MONTHS.find((item) => item.value === Number(mes))?.label ?? mes;
    XLSX.writeFile(
      wb,
      `Nomina_Accesorios_${EXCEL_PERFIL[resultado.tipo]}_${mesLabel}_${ano}.xlsx`,
    );
  };

  if (blocked) return null;

  return (
    <div data-testid="nomina-accesorios-page" className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <h1 className="app-title-xl brand-text">Nómina accesorios</h1>
          <EmpresaBadge />
        </div>
        <p className="text-gray-500 mt-1">
          Seleccione año, mes y perfil para generar el informe.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-6 shadow-lg space-y-4">
        <div className="app-filter-grid">
          <div className="flex flex-col gap-1">
            <label htmlFor="nomina-acc-ano" className="text-xs font-medium text-gray-600">
              Año
            </label>
            <select
              id="nomina-acc-ano"
              className={NOMINA_STYLES.input}
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
            >
              {yearsForSelect().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="nomina-acc-mes" className="text-xs font-medium text-gray-600">
              Mes
            </label>
            <select
              id="nomina-acc-mes"
              data-testid="nomina-acc-mes"
              className={NOMINA_STYLES.input}
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            >
              <option value="">Seleccione un mes...</option>
              {MONTHS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="nomina-acc-perfil" className="text-xs font-medium text-gray-600">
              Perfil
            </label>
            <select
              id="nomina-acc-perfil"
              className={NOMINA_STYLES.input}
              value={perfil}
              onChange={(e) =>
                setPerfil(
                  e.target.value
                    ? (Number(e.target.value) as TipoInformeNominaAccesorios)
                    : '',
                )
              }
            >
              <option value="">Seleccione un perfil...</option>
              {TIPOS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            data-testid="nomina-acc-generar"
            onClick={onGenerar}
            disabled={listarMutation.isPending}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-primary-dark) transition-colors disabled:opacity-60"
          >
            <Search size={16} className="mr-2" />
            {listarMutation.isPending ? 'Generando...' : 'Generar nómina'}
          </button>
          {resultado && rowsCount > 0 ? (
            <button
              type="button"
              onClick={() => void onExportExcel()}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet size={16} className="mr-2" /> Exportar a Excel
            </button>
          ) : null}
        </div>
      </div>

      {resultado ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
          {listarMutation.isPending ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : rowsCount === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">
                {resultado.emptyMessage}
              </p>
            </div>
          ) : (
            <div data-testid="nomina-acc-table" className="app-table-scroll">
              <NominaAccesoriosTabla resultado={resultado} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function NominaAccesoriosTabla({
  resultado,
}: {
  resultado: NominaAccesoriosResultado;
}) {
  if (resultado.tipo === 1) {
    return (
      <table className="w-full min-w-[900px] divide-y divide-gray-200 text-xs md:text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-center font-semibold">Fecha</th>
            <th className="px-3 py-2 text-center font-semibold">Nombres</th>
            <th className="px-3 py-2 text-center font-semibold">Venta propia</th>
            <th className="px-3 py-2 text-center font-semibold">Venta compartida</th>
            <th className="px-3 py-2 text-center font-semibold">Comisión propia</th>
            <th className="px-3 py-2 text-center font-semibold">Comisión compartida</th>
            <th className="px-3 py-2 text-center font-semibold">Total comisión</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {resultado.auxiliar.map((row, index) => (
            <tr key={`${row.nombres}-${index}`}>
              <td className="px-3 py-1.5 text-center">{row.fecha}</td>
              <td className="px-3 py-1.5 text-center">{row.nombres}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.ventaPropia)}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.ventaCompartida)}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.comisionPropia)}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.comisionCompartida)}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.totalComision)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (resultado.tipo === 2) {
    return (
      <table className="w-full min-w-[1200px] divide-y divide-gray-200 text-xs md:text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-center font-semibold">Fecha</th>
            <th className="px-3 py-2 text-center font-semibold">Documento</th>
            <th className="px-3 py-2 text-center font-semibold">Nombres</th>
            <th className="px-3 py-2 text-center font-semibold">Venta propia</th>
            <th className="px-3 py-2 text-center font-semibold">Venta compartida</th>
            <th className="px-3 py-2 text-center font-semibold">VH entregados</th>
            <th className="px-3 py-2 text-center font-semibold">Comisión propia</th>
            <th className="px-3 py-2 text-center font-semibold">Comisión compartida</th>
            <th className="px-3 py-2 text-center font-semibold">Total comisión</th>
            <th className="px-3 py-2 text-center font-semibold">Share accesorios</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {resultado.asesor.map((row) => (
            <tr key={`${row.documento}-${row.nombres}`}>
              <td className="px-3 py-1.5 text-center">{row.fecha}</td>
              <td className="px-3 py-1.5 text-center">{row.documento}</td>
              <td className="px-3 py-1.5 text-center">{row.nombres}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.ventaPropia)}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.ventaCompartida)}</td>
              <td className="px-3 py-1.5 text-center">{formatNumberEs(row.vhEntregados)}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.comisionPropia)}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.comisionCompartida)}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.totalComision)}</td>
              <td className="px-3 py-1.5 text-center">
                {row.shareAccesorios == null
                  ? 'N/A'
                  : formatNumberEs(row.shareAccesorios, 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (resultado.tipo === 3) {
    return (
      <table className="w-full min-w-[700px] divide-y divide-gray-200 text-xs md:text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-center font-semibold">Fecha</th>
            <th className="px-3 py-2 text-center font-semibold">Nombres</th>
            <th className="px-3 py-2 text-center font-semibold">Total horas</th>
            <th className="px-3 py-2 text-center font-semibold">Comisión</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {resultado.tecnicos.map((row, index) => (
            <tr key={`${row.nombres}-${index}`}>
              <td className="px-3 py-1.5 text-center">{row.fecha}</td>
              <td className="px-3 py-1.5 text-center">{row.nombres}</td>
              <td className="px-3 py-1.5 text-center">{formatNumberEs(row.totalHoras, 2)}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.comision)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (resultado.tipo === 4) {
    return (
      <table className="w-full min-w-[700px] divide-y divide-gray-200 text-xs md:text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-center font-semibold">Fecha</th>
            <th className="px-3 py-2 text-center font-semibold">Nombres</th>
            <th className="px-3 py-2 text-center font-semibold">Venta accesorios</th>
            <th className="px-3 py-2 text-center font-semibold">Comisión</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {resultado.otrasMarcas.map((row, index) => (
            <tr key={`${row.vendedor}-${index}`}>
              <td className="px-3 py-1.5 text-center">{row.fecha}</td>
              <td className="px-3 py-1.5 text-center">{row.vendedor}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.ventaAccesorios)}</td>
              <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.comision, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full min-w-[700px] divide-y divide-gray-200 text-xs md:text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-2 text-center font-semibold">Fecha</th>
          <th className="px-3 py-2 text-center font-semibold">Agencia</th>
          <th className="px-3 py-2 text-center font-semibold">Tiempo</th>
          <th className="px-3 py-2 text-center font-semibold">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {resultado.moInterna.map((row, index) => (
          <tr key={`${row.agencia}-${index}`}>
            <td className="px-3 py-1.5 text-center">{row.fecha}</td>
            <td className="px-3 py-1.5 text-center">{row.agencia}</td>
            <td className="px-3 py-1.5 text-center">{formatNumberEs(row.tiempo, 2)}</td>
            <td className="px-3 py-1.5 text-center">{formatMoneyEs(row.total, 2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
