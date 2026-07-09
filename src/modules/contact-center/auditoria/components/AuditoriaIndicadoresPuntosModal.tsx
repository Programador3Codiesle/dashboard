'use client';

import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/shared/ui/Modal';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  inputClass,
} from '@/modules/contact-center/shared/constants/ui';
import {
  auditoriaContactService,
  IndicadorPuntosRow,
  IndicadoresPuntosResponse,
} from '../services/auditoria-contact.service';

type Props = {
  open: boolean;
  data: IndicadoresPuntosResponse | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

function buildDatosInd(rows: IndicadorPuntosRow[]) {
  return rows
    .map((r) => `${r.idIndicador},${r.nombres},${r.puntuacion}`)
    .join(',');
}

export function AuditoriaIndicadoresPuntosModal({
  open,
  data,
  onClose,
  onSaved,
  onError,
  onSuccess,
}: Props) {
  const [rows, setRows] = useState<IndicadorPuntosRow[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (data?.indicadores) {
      setRows(data.indicadores.map((r) => ({ ...r })));
    }
  }, [data]);

  const sumaPuntos = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.puntuacion) || 0), 0),
    [rows],
  );

  const handlePuntosChange = (idIndicador: number, value: string) => {
    const puntos = Number(value);
    if (Number.isNaN(puntos) || puntos < 0) return;
    setRows((prev) =>
      prev.map((r) =>
        r.idIndicador === idIndicador ? { ...r, puntuacion: puntos } : r,
      ),
    );
  };

  const handleGuardar = async () => {
    if (!data) return;
    if (sumaPuntos !== 100) {
      onError('La suma de puntos debe ser exactamente 100');
      return;
    }
    if (rows.some((r) => r.editable && r.puntuacion <= 0)) {
      onError('Ningún indicador editable puede tener puntaje 0');
      return;
    }

    setGuardando(true);
    try {
      const result = await auditoriaContactService.guardarCambioIndicadores({
        datosInd: buildDatosInd(rows),
        idIndicador: data.idIndicadorCambiar,
        estado: data.estadoIndCambiar,
      });
      if (result.result === 1) {
        onSuccess('Estado del indicador actualizado');
        onSaved();
        onClose();
      } else {
        onError('No se pudo guardar el cambio de indicadores');
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const accionLabel =
    data?.estadoIndCambiar === 2 ? 'habilitar' : 'inhabilitar';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Redistribuir puntos al ${accionLabel} indicador`}
      width="min(96vw, 720px)"
    >
      <p className="text-sm text-gray-600 mb-3">
        Ajuste la puntuación de cada indicador. La suma total debe ser{' '}
        <strong>100</strong> antes de guardar.
      </p>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Indicador</th>
              <th className="px-3 py-2 text-center w-28">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.idIndicador} className="border-t">
                <td className="px-3 py-2">{r.idIndicador}</td>
                <td className="px-3 py-2">{r.nombres}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    className={`${inputClass} text-center`}
                    value={r.puntuacion}
                    disabled={!r.editable}
                    onChange={(e) => handlePuntosChange(r.idIndicador, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={2} className="px-3 py-2 text-right">
                Total
              </td>
              <td
                className={`px-3 py-2 text-center ${
                  sumaPuntos !== 100 ? 'text-red-600' : 'text-green-700'
                }`}
              >
                {sumaPuntos}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className={btnSecondaryClass} onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className={btnPrimaryClass}
          onClick={handleGuardar}
          disabled={guardando || sumaPuntos !== 100}
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </Modal>
  );
}
