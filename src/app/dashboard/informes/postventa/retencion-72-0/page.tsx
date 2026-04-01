'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Retencion720Row,
  retencion720Service,
} from '@/modules/informes/postventa/services/retencion-72-0.service';
import { useToast } from '@/components/shared/ui/ToastContext';

function getPorcentaje(entradas: number, parque: number): number {
  if (!parque || parque <= 0) return 0;
  return (entradas / parque) * 100;
}

export default function Retencion720Page() {
  const [rows, setRows] = useState<Retencion720Row[]>([]);
  const { showError, showInfo } = useToast();

  const { mutate, status } = useMutation<Retencion720Row[], Error, void>({
    mutationFn: async () => {
      const data = await retencion720Service.obtener();
      setRows(data);
      if (!data.length) {
        showInfo('No hay datos para mostrar en el informe de retención 72-0.');
      }
      return data;
    },
    onError: () => {
      showError('No se pudo cargar el informe de retención 72-0.');
    },
  });

  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalParque12 = rows.reduce((acc, r) => acc + r.p0_12, 0);
  const totalEntradas12 = rows.reduce((acc, r) => acc + r.e0_12, 0);
  const totalParque24 = rows.reduce((acc, r) => acc + r.p13_24, 0);
  const totalEntradas24 = rows.reduce((acc, r) => acc + r.e13_24, 0);
  const totalParque36 = rows.reduce((acc, r) => acc + r.p25_36, 0);
  const totalEntradas36 = rows.reduce((acc, r) => acc + r.e25_36, 0);
  const totalParque48 = rows.reduce((acc, r) => acc + r.p37_48, 0);
  const totalEntradas48 = rows.reduce((acc, r) => acc + r.e37_48, 0);
  const totalParque60 = rows.reduce((acc, r) => acc + r.p49_60, 0);
  const totalEntradas60 = rows.reduce((acc, r) => acc + r.e49_60, 0);
  const totalParque72 = rows.reduce((acc, r) => acc + r.p61_72, 0);
  const totalEntradas72 = rows.reduce((acc, r) => acc + r.e61_72, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">
            Informe Retención 72 - 0
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Retención de clientes por rango de meses (12-0, 24-12, 36-24, 48-36,
            60-48, 72-60) para Flota y Retail.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          Resumen por tipo de vehículo
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[--color-primary] text-white text-center">
                <th className="px-2 py-2 align-middle">Tipo</th>
                <th className="px-2 py-2 align-middle">Parque 12-0</th>
                <th className="px-2 py-2 align-middle">Entradas 12-0</th>
                <th className="px-2 py-2 align-middle">% Ret. 12-0</th>
                <th className="px-2 py-2 align-middle">Parque 24-12</th>
                <th className="px-2 py-2 align-middle">Entradas 24-12</th>
                <th className="px-2 py-2 align-middle">% Ret. 24-12</th>
                <th className="px-2 py-2 align-middle">Parque 36-24</th>
                <th className="px-2 py-2 align-middle">Entradas 36-24</th>
                <th className="px-2 py-2 align-middle">% Ret. 36-24</th>
                <th className="px-2 py-2 align-middle">Parque 48-36</th>
                <th className="px-2 py-2 align-middle">Entradas 48-36</th>
                <th className="px-2 py-2 align-middle">% Ret. 48-36</th>
                <th className="px-2 py-2 align-middle">Parque 60-48</th>
                <th className="px-2 py-2 align-middle">Entradas 60-48</th>
                <th className="px-2 py-2 align-middle">% Ret. 60-48</th>
                <th className="px-2 py-2 align-middle">Parque 72-60</th>
                <th className="px-2 py-2 align-middle">Entradas 72-60</th>
                <th className="px-2 py-2 align-middle">% Ret. 72-60</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.tipoVh} className="border-t text-center">
                  <td className="px-2 py-1 font-semibold text-left">
                    {row.tipoVh}
                  </td>
                  <td className="px-2 py-1">{row.p0_12}</td>
                  <td className="px-2 py-1">{row.e0_12}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(row.e0_12, row.p0_12).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1">{row.p13_24}</td>
                  <td className="px-2 py-1">{row.e13_24}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(row.e13_24, row.p13_24).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1">{row.p25_36}</td>
                  <td className="px-2 py-1">{row.e25_36}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(row.e25_36, row.p25_36).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1">{row.p37_48}</td>
                  <td className="px-2 py-1">{row.e37_48}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(row.e37_48, row.p37_48).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1">{row.p49_60}</td>
                  <td className="px-2 py-1">{row.e49_60}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(row.e49_60, row.p49_60).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1">{row.p61_72}</td>
                  <td className="px-2 py-1">{row.e61_72}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(row.e61_72, row.p61_72).toFixed(1)}%
                  </td>
                </tr>
              ))}

              {status !== 'pending' && rows.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-3 text-center text-gray-400 text-xs"
                    colSpan={19}
                  >
                    No hay datos para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="border-t bg-slate-50">
                <tr className="text-center font-semibold">
                  <td className="px-2 py-1 text-left">Total</td>
                  <td className="px-2 py-1">{totalParque12}</td>
                  <td className="px-2 py-1">{totalEntradas12}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(totalEntradas12, totalParque12).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1">{totalParque24}</td>
                  <td className="px-2 py-1">{totalEntradas24}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(totalEntradas24, totalParque24).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1">{totalParque36}</td>
                  <td className="px-2 py-1">{totalEntradas36}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(totalEntradas36, totalParque36).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1">{totalParque48}</td>
                  <td className="px-2 py-1">{totalEntradas48}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(totalEntradas48, totalParque48).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1">{totalParque60}</td>
                  <td className="px-2 py-1">{totalEntradas60}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(totalEntradas60, totalParque60).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1">{totalParque72}</td>
                  <td className="px-2 py-1">{totalEntradas72}</td>
                  <td className="px-2 py-1">
                    {getPorcentaje(totalEntradas72, totalParque72).toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

