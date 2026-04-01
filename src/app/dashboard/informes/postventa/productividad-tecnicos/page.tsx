'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  ProductividadTecnicosResponse,
  productividadTecnicosService,
} from '@/modules/informes/postventa/services/productividad-tecnicos.service';
import { useToast } from '@/components/shared/ui/ToastContext';

const PATIOS_OPCIONES = [
  { value: 1, label: 'GIRÓN GASOLINA' },
  { value: 2, label: 'GIRÓN COLISIÓN' },
  { value: 3, label: 'GIRÓN DIESEL' },
  { value: 4, label: 'ROSITA' },
  { value: 5, label: 'BARRANCA GASOLINA' },
  { value: 6, label: 'BARRANCA DIESEL' },
  { value: 7, label: 'VILLA GASOLINA' },
  { value: 8, label: 'VILLA DIESEL' },
  { value: 9, label: 'VILLA COLISIÓN' },
];

function getRowBg(productividad: number) {
  if (productividad >= 100) return 'bg-emerald-50';
  return 'bg-rose-50';
}

export default function ProductividadTecnicosPage() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [patiosSeleccionados, setPatiosSeleccionados] = useState<number[]>([]);
  const [data, setData] = useState<ProductividadTecnicosResponse | null>(null);

  const { showError, showInfo } = useToast();

  const { mutate, status } = useMutation<
    ProductividadTecnicosResponse,
    Error,
    void
  >({
    mutationFn: async () => {
      const resp = await productividadTecnicosService.obtener({
        year,
        month,
        patios: patiosSeleccionados,
      });
      setData(resp);
      if (!resp.actual.length && !resp.consolidado.length) {
        showInfo('No hay datos para los filtros seleccionados.');
      }
      return resp;
    },
    onError: () => {
      showError('No se pudo cargar el informe de productividad de técnicos.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  const handleTogglePatio = (value: number) => {
    setPatiosSeleccionados((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSeleccionarTodos = () => {
    setPatiosSeleccionados(PATIOS_OPCIONES.map((p) => p.value));
  };

  const handleLimpiarPatios = () => {
    setPatiosSeleccionados([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">
            Productividad Técnicos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Consulta las horas trabajadas y productividad por técnico, mes
            actual y consolidado.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Año</label>
            <input
              type="number"
              min={2000}
              max={9999}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Mes</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            >
              <option value={1}>Enero</option>
              <option value={2}>Febrero</option>
              <option value={3}>Marzo</option>
              <option value={4}>Abril</option>
              <option value={5}>Mayo</option>
              <option value={6}>Junio</option>
              <option value={7}>Julio</option>
              <option value={8}>Agosto</option>
              <option value={9}>Septiembre</option>
              <option value={10}>Octubre</option>
              <option value={11}>Noviembre</option>
              <option value={12}>Diciembre</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Patios (múltiple)
            </label>
            <div className="border rounded-lg px-3 py-2 text-sm space-y-2">
              <div className="flex flex-wrap gap-2">
                {PATIOS_OPCIONES.map((p) => {
                  const selected = patiosSeleccionados.includes(p.value);
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleTogglePatio(p.value)}
                      className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                        selected
                          ? 'bg-[--color-primary] text-white border-[--color-primary]'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSeleccionarTodos}
                  className="text-[--color-primary] hover:underline"
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  onClick={handleLimpiarPatios}
                  className="text-gray-500 hover:underline"
                >
                  Limpiar selección
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status === 'pending'}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium brand-btn disabled:opacity-60"
          >
            {status === 'pending' ? 'Generando...' : 'Generar'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 text-center">
            Mes actual
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[--color-primary] text-white text-center">
                  <th className="px-2 py-2">NIT</th>
                  <th className="px-2 py-2">NOMBRE</th>
                  <th className="px-2 py-2">PATIO</th>
                  <th className="px-2 py-2">H. CLIENTE</th>
                  <th className="px-2 py-2">H. GARANTÍA</th>
                  <th className="px-2 py-2">H. SERVICIO</th>
                  <th className="px-2 py-2">H. INTERNAS</th>
                  <th className="px-2 py-2">TOTAL H.</th>
                  <th className="px-2 py-2">H. DISP.</th>
                  <th className="px-2 py-2">PRODUCTIVIDAD</th>
                </tr>
              </thead>
              <tbody>
                {data?.actual.map((row) => (
                  <tr
                    key={`a-${row.nit}-${row.patio}`}
                    className={`${getRowBg(row.productividad)} border-t`}
                  >
                    <td className="px-2 py-1 text-center">{row.nit}</td>
                    <td className="px-2 py-1 text-center">{row.nombres}</td>
                    <td className="px-2 py-1 text-center">{row.patio}</td>
                    <td className="px-2 py-1 text-center">
                      {row.horasCliente.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {row.horasGarantia.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {row.horasServicio.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {row.horasInterno.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {row.totalHoras.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {row.horasDisponibles.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center font-semibold">
                      {row.productividad.toFixed(2)}%
                    </td>
                  </tr>
                ))}
                {status !== 'pending' && (!data || !data.actual.length) && (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-gray-400 text-xs"
                      colSpan={10}
                    >
                      Sin datos para el mes actual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 text-center">
            Consolidado
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[--color-primary] text-white text-center">
                  <th className="px-2 py-2">NIT</th>
                  <th className="px-2 py-2">NOMBRE</th>
                  <th className="px-2 py-2">PATIO</th>
                  <th className="px-2 py-2">H. CLIENTE</th>
                  <th className="px-2 py-2">H. GARANTÍA</th>
                  <th className="px-2 py-2">H. SERVICIO</th>
                  <th className="px-2 py-2">H. INTERNAS</th>
                  <th className="px-2 py-2">TOTAL H.</th>
                  <th className="px-2 py-2">H. DISP.</th>
                  <th className="px-2 py-2">PRODUCTIVIDAD</th>
                </tr>
              </thead>
              <tbody>
                {data?.consolidado.map((row) => (
                  <tr
                    key={`c-${row.nit}-${row.patio}`}
                    className={`${getRowBg(row.productividad)} border-t`}
                  >
                    <td className="px-2 py-1 text-center">{row.nit}</td>
                    <td className="px-2 py-1 text-center">{row.nombres}</td>
                    <td className="px-2 py-1 text-center">{row.patio}</td>
                    <td className="px-2 py-1 text-center">
                      {row.horasCliente.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {row.horasGarantia.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {row.horasServicio.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {row.horasInterno.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {row.totalHoras.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {row.horasDisponibles.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center font-semibold">
                      {row.productividad.toFixed(2)}%
                    </td>
                  </tr>
                ))}
                {status !== 'pending' && (!data || !data.consolidado.length) && (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-gray-400 text-xs"
                      colSpan={10}
                    >
                      Sin datos para el consolidado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

