'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Modal from '@/components/shared/ui/Modal';
import { useToast } from '@/components/ui/use-toast';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  inputClass,
} from '@/modules/repuestos/shared/constants/ui';
import {
  entradasVariasService,
  RepuestoLinea,
} from '../services/entradas-varias.service';

export function EntradasVariasGestion() {
  const { showError, showSuccess } = useToast();
  const [nOrden, setNOrden] = useState('');
  const [placa, setPlaca] = useState('');
  const [bodegaNum, setBodegaNum] = useState('');
  const [bodegaDesc, setBodegaDesc] = useState('');
  const [obs, setObs] = useState('');
  const [repuestos, setRepuestos] = useState<RepuestoLinea[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [codRpto, setCodRpto] = useState('');
  const [descRpto, setDescRpto] = useState('');
  const [cantRpto, setCantRpto] = useState('');

  const buscarOrden = useMutation({
    mutationFn: () => entradasVariasService.buscarOrden(Number(nOrden)),
    onSuccess: (data) => {
      setPlaca(data.placa ?? '');
      setBodegaNum(String(data.bodega));
      setBodegaDesc(data.descripcion);
    },
    onError: (e: Error) => showError(e.message),
  });

  const validarRepuesto = useMutation({
    mutationFn: () => entradasVariasService.validarRepuesto(codRpto.trim()),
    onSuccess: (data) => setDescRpto(data.descripcion),
    onError: (e: Error) => showError(e.message),
  });

  const guardar = useMutation({
    mutationFn: () =>
      entradasVariasService.crearSolicitud({
        nOrden: Number(nOrden),
        obs,
        repuestos: repuestos.map((r) => ({
          referencia: r.referencia,
          cantidad: r.cantidad,
        })),
      }),
    onSuccess: (data) => {
      showSuccess(data.message);
      setNOrden('');
      setPlaca('');
      setBodegaNum('');
      setBodegaDesc('');
      setObs('');
      setRepuestos([]);
    },
    onError: (e: Error) => showError(e.message),
  });

  const agregarRepuesto = () => {
    if (!codRpto || !descRpto || !cantRpto) {
      showError('Complete referencia, descripción y cantidad');
      return;
    }
    if (repuestos.some((r) => r.referencia === codRpto.trim())) {
      showError('La referencia ya está en la tabla');
      return;
    }
    setRepuestos((prev) => [
      ...prev,
      {
        referencia: codRpto.trim(),
        descripcion: descRpto,
        cantidad: Number(cantRpto),
      },
    ]);
    setCodRpto('');
    setDescRpto('');
    setCantRpto('');
    setModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">N° Orden</label>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              className={inputClass}
              value={nOrden}
              onChange={(e) => setNOrden(e.target.value)}
            />
            <button
              type="button"
              className="btn-secondary text-sm px-3"
              onClick={() => buscarOrden.mutate()}
              disabled={!nOrden || buscarOrden.isPending}
            >
              Buscar
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Placa</label>
          <input className={`${inputClass} mt-1`} value={placa} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">N° Bodega</label>
          <input className={`${inputClass} mt-1`} value={bodegaNum} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Bodega</label>
          <input className={`${inputClass} mt-1`} value={bodegaDesc} readOnly />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Repuestos</h3>
        <button type="button" className={`${btnPrimaryClass} text-sm`} onClick={() => setModalOpen(true)}>
          Añadir repuesto
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2">Referencia</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Cantidad</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {repuestos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  Sin repuestos agregados
                </td>
              </tr>
            ) : (
              repuestos.map((r) => (
                <tr key={r.referencia} className="border-t">
                  <td className="px-3 py-2">{r.referencia}</td>
                  <td className="px-3 py-2">{r.descripcion}</td>
                  <td className="px-3 py-2 text-center">{r.cantidad}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      className="text-red-600 text-xs"
                      onClick={() =>
                        setRepuestos((prev) => prev.filter((x) => x.referencia !== r.referencia))
                      }
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Observación</label>
        <textarea
          className={`${inputClass} mt-1 min-h-24`}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Escriba aquí sus observaciones"
        />
      </div>

      <button
        type="button"
        className={btnPrimaryClass}
        disabled={!nOrden || !obs || repuestos.length === 0 || guardar.isPending}
        onClick={() => guardar.mutate()}
      >
        Enviar solicitud
      </button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Añadir repuestos">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Referencia</label>
            <div className="flex gap-2 mt-1">
              <input
                className={`${inputClass} flex-1`}
                value={codRpto}
                onChange={(e) => setCodRpto(e.target.value)}
              />
              <button
                type="button"
                className={btnSecondaryClass}
                onClick={() => validarRepuesto.mutate()}
                disabled={!codRpto || validarRepuesto.isPending}
              >
                Validar
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Descripción</label>
            <input className={`${inputClass} mt-1`} value={descRpto} readOnly />
          </div>
          <div>
            <label className="text-sm font-medium">Cantidad</label>
            <input
              type="number"
              min={1}
              className={`${inputClass} mt-1`}
              value={cantRpto}
              onChange={(e) => setCantRpto(e.target.value)}
            />
          </div>
          <button type="button" className={`${btnPrimaryClass} w-full`} onClick={agregarRepuesto}>
            Añadir a la tabla
          </button>
        </div>
      </Modal>
    </div>
  );
}
