'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Modal from '@/components/shared/ui/Modal';
import { useToast } from '@/components/ui/use-toast';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  inputClass,
} from '@/modules/repuestos/shared/constants/ui';
import {
  DetalleLinea,
  solicitudesEvService,
  SolicitudEvItem,
} from '../services/solicitudes-ev.service';

const estadoRowClass = (estado: number | null) => {
  if (estado === 0) return 'bg-yellow-50';
  if (estado === 1) return 'bg-green-50';
  if (estado === 2) return 'bg-red-50';
  return '';
};

export function SolicitudesEvGestion() {
  const { showError, showSuccess } = useToast();
  const [filtros, setFiltros] = useState({
    nOrden: '',
    placa: '',
    bodega: '',
    fechaRegistro: '',
  });
  const [buscar, setBuscar] = useState(false);
  const [modalGestion, setModalGestion] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalEv, setModalEv] = useState(false);
  const [modalSv, setModalSv] = useState(false);
  const [solicitudActiva, setSolicitudActiva] = useState<SolicitudEvItem | null>(null);
  const [detalle, setDetalle] = useState<DetalleLinea[]>([]);
  const [authLineas, setAuthLineas] = useState<Record<number, 1 | 2>>({});
  const [obsAuth, setObsAuth] = useState('');
  const [evForm, setEvForm] = useState({ tipoEv: '', numeroEv: '', numeroOrdenEv: '', obs: '' });
  const [svForm, setSvForm] = useState({ tipoSv: '', numeroSv: '', numeroOrdenSv: '', obs: '' });
  const [lineaActiva, setLineaActiva] = useState<DetalleLinea | null>(null);

  const { data: bodegas = [] } = useQuery({
    queryKey: ['repuestos', 'solicitudes-ev', 'bodegas'],
    queryFn: () => solicitudesEvService.listarBodegas(),
  });

  const listarQuery = useQuery({
    queryKey: ['repuestos', 'solicitudes-ev', 'listar', filtros, buscar],
    queryFn: () =>
      solicitudesEvService.listar({
        nOrden: filtros.nOrden ? Number(filtros.nOrden) : undefined,
        placa: filtros.placa || undefined,
        bodega: filtros.bodega ? Number(filtros.bodega) : undefined,
        fechaRegistro: filtros.fechaRegistro || undefined,
      }),
    enabled: buscar,
  });

  const cargarDetalle = useCallback(
    async (item: SolicitudEvItem, modo: 0 | 1) => {
      try {
        const data = await solicitudesEvService.detalle(item.id, modo);
        setSolicitudActiva(item);
        setDetalle(data.lineas);
        setAuthLineas({});
        setObsAuth('');
        if (modo === 0) setModalGestion(true);
        else setModalDetalle(true);
      } catch (e) {
        showError(e instanceof Error ? e.message : 'Error al cargar detalle');
      }
    },
    [showError],
  );

  const autorizar = useMutation({
    mutationFn: () => {
      if (!solicitudActiva) throw new Error('Sin solicitud');
      const lineas = Object.entries(authLineas).map(([id, estadoAuth]) => ({
        idDetalle: Number(id),
        estadoAuth,
      }));
      return solicitudesEvService.autorizar({
        idSolicitud: solicitudActiva.id,
        obsAuth,
        lineas,
      });
    },
    onSuccess: (data: { message: string }) => {
      showSuccess(data.message);
      setModalGestion(false);
      setBuscar(true);
      listarQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  const registrarEv = useMutation({
    mutationFn: () => {
      if (!solicitudActiva || !lineaActiva) throw new Error('Datos incompletos');
      return solicitudesEvService.registrarEv({
        idSolicitud: solicitudActiva.id,
        idDetalle: lineaActiva.id,
        tipoEv: evForm.tipoEv,
        numeroEv: Number(evForm.numeroEv),
        numeroOrdenEv: Number(evForm.numeroOrdenEv),
        obs: evForm.obs,
      });
    },
    onSuccess: (data: { message: string }) => {
      showSuccess(data.message);
      setModalEv(false);
      if (solicitudActiva) cargarDetalle(solicitudActiva, 1);
      listarQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  const registrarSv = useMutation({
    mutationFn: () => {
      if (!solicitudActiva || !lineaActiva) throw new Error('Datos incompletos');
      return solicitudesEvService.registrarSv({
        idSolicitud: solicitudActiva.id,
        idDetalle: lineaActiva.id,
        tipoSv: svForm.tipoSv,
        numeroSv: Number(svForm.numeroSv),
        numeroOrdenSv: Number(svForm.numeroOrdenSv),
        obs: svForm.obs,
      });
    },
    onSuccess: (data: { message: string }) => {
      showSuccess(data.message);
      setModalSv(false);
      if (solicitudActiva) cargarDetalle(solicitudActiva, 1);
      listarQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  const marcarEntregado = useMutation({
    mutationFn: ({ idDetalle, idSolicitud }: { idDetalle: number; idSolicitud: number }) =>
      solicitudesEvService.marcarEntregado(idDetalle, idSolicitud),
    onSuccess: (data: { message: string }) => {
      showSuccess(data.message);
      if (solicitudActiva) cargarDetalle(solicitudActiva, 1);
      listarQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="number"
          placeholder="N° Orden"
          className={inputClass}
          value={filtros.nOrden}
          onChange={(e) => setFiltros((f) => ({ ...f, nOrden: e.target.value }))}
        />
        <input
          placeholder="Placa"
          className={inputClass}
          value={filtros.placa}
          onChange={(e) => setFiltros((f) => ({ ...f, placa: e.target.value.toUpperCase() }))}
        />
        <select
          className={inputClass}
          value={filtros.bodega}
          onChange={(e) => setFiltros((f) => ({ ...f, bodega: e.target.value }))}
        >
          <option value="">Bodega</option>
          {bodegas.map((b) => (
            <option key={b.bodega} value={b.bodega}>
              {b.descripcion}
            </option>
          ))}
        </select>
        <input
          type="date"
          className={inputClass}
          value={filtros.fechaRegistro}
          onChange={(e) => setFiltros((f) => ({ ...f, fechaRegistro: e.target.value }))}
        />
        <button type="button" className={btnPrimaryClass} onClick={() => setBuscar(true)}>
          Buscar
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['N° Solicitud', 'N° Orden', 'Placa', 'Bodega', 'Fecha', 'Solicitado', 'Obs.', 'Fecha auth', 'Autorizado', 'Obs. auth', 'Opción'].map((h) => (
                <th key={h} className="px-2 py-2 text-center font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listarQuery.isLoading ? (
              <tr><td colSpan={11} className="py-8 text-center text-gray-500">Cargando...</td></tr>
            ) : (listarQuery.data ?? []).length === 0 ? (
              <tr><td colSpan={11} className="py-8 text-center text-gray-500">Sin resultados</td></tr>
            ) : (
              (listarQuery.data ?? []).map((row) => (
                <tr key={row.id} className={`border-t ${estadoRowClass(row.estadoAuth)}`}>
                  <td className="px-2 py-2 text-center">{row.id}</td>
                  <td className="px-2 py-2 text-center">{row.nOrden}</td>
                  <td className="px-2 py-2 text-center">{row.placa}</td>
                  <td className="px-2 py-2 text-center">{row.bodega}</td>
                  <td className="px-2 py-2 text-center">{row.fechaRegistro}</td>
                  <td className="px-2 py-2 text-center">{row.solicitadoPor}</td>
                  <td className="px-2 py-2">{row.obsRegistro}</td>
                  <td className="px-2 py-2 text-center">{row.fechaAuth}</td>
                  <td className="px-2 py-2 text-center">{row.autorizadoPor}</td>
                  <td className="px-2 py-2">{row.obsAuth}</td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      className="text-xs text-[var(--color-primary)] font-semibold"
                      onClick={() => cargarDetalle(row, row.estadoAuth === 0 && row.puedeGestionar ? 0 : 1)}
                    >
                      {row.estadoAuth === 0 && row.puedeGestionar ? 'Gestionar' : 'Ver'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalGestion} onClose={() => setModalGestion(false)} title={`Autorizar solicitud #${solicitudActiva?.id}`} width="min(96vw, 1200px)">
        <div className="space-y-4 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                {['Referencia', 'Descripción', 'Cant.', 'Stock', 'Autorizado'].map((h) => (
                  <th key={h} className="px-2 py-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detalle.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-2 py-1">{l.referencia}</td>
                  <td className="px-2 py-1">{l.descripcion}</td>
                  <td className="px-2 py-1 text-center">{l.cantidad}</td>
                  <td className="px-2 py-1">
                    {l.stock.map((s) => (
                      <div key={s.bodega}>{s.bodega} - {s.descripcion}: {s.stock}</div>
                    ))}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {l.puedeAutorizar ? (
                      <div className="flex gap-2 justify-center">
                        <label><input type="radio" name={`auth-${l.id}`} onChange={() => setAuthLineas((p) => ({ ...p, [l.id]: 1 }))} /> SI</label>
                        <label><input type="radio" name={`auth-${l.id}`} onChange={() => setAuthLineas((p) => ({ ...p, [l.id]: 2 }))} /> NO</label>
                      </div>
                    ) : (
                      l.autorizacionLabel
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <textarea className={`${inputClass} min-h-20`} placeholder="Observación autorización" value={obsAuth} onChange={(e) => setObsAuth(e.target.value)} />
          <button type="button" className={btnPrimaryClass} onClick={() => autorizar.mutate()} disabled={!obsAuth || autorizar.isPending}>Guardar</button>
        </div>
      </Modal>

      <Modal open={modalDetalle} onClose={() => setModalDetalle(false)} title={`Detalle solicitud #${solicitudActiva?.id}`} width="min(96vw, 1200px)">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                {['Ref', 'Desc', 'Cant', 'Auth', 'EV', 'Obs EV', 'SV', 'Obs SV', 'Entregado'].map((h) => (
                  <th key={h} className="px-2 py-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detalle.map((l) => (
                <tr key={l.id} className={`border-t ${l.colorFila === 'verde' ? 'bg-green-50' : l.colorFila === 'rojo' ? 'bg-red-50' : ''}`}>
                  <td className="px-2 py-1">{l.referencia}</td>
                  <td className="px-2 py-1">{l.descripcion}</td>
                  <td className="px-2 py-1 text-center">{l.cantidad}</td>
                  <td className="px-2 py-1 text-center">{l.autorizacionLabel}</td>
                  <td className="px-2 py-1 text-center">
                    {l.puedeRegistrarEv ? (
                      <button type="button" className="text-[var(--color-primary)] text-xs" onClick={() => { setLineaActiva(l); setEvForm({ tipoEv: '', numeroEv: '', numeroOrdenEv: String(solicitudActiva?.nOrden ?? ''), obs: '' }); setModalEv(true); }}>Registrar EV</button>
                    ) : l.numeroEv}
                  </td>
                  <td className="px-2 py-1">{l.obsEv}</td>
                  <td className="px-2 py-1 text-center">
                    {l.puedeRegistrarSv ? (
                      <button type="button" className="text-[var(--color-primary)] text-xs" onClick={() => { setLineaActiva(l); setSvForm({ tipoSv: '', numeroSv: '', numeroOrdenSv: String(solicitudActiva?.nOrden ?? ''), obs: '' }); setModalSv(true); }}>Registrar SV</button>
                    ) : l.numeroSv}
                  </td>
                  <td className="px-2 py-1">{l.obsSv}</td>
                  <td className="px-2 py-1 text-center">
                    {l.puedeMarcarEntregado ? (
                      <button type="button" className={btnSecondaryClass} onClick={() => marcarEntregado.mutate({ idDetalle: l.id, idSolicitud: solicitudActiva!.id })}>Entregar</button>
                    ) : String(l.entregado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal open={modalEv} onClose={() => setModalEv(false)} title="Entrada Varia">
        <div className="space-y-3">
          {(['tipoEv', 'numeroEv', 'numeroOrdenEv'] as const).map((field) => (
            <input key={field} className={inputClass} placeholder={field} value={evForm[field]} onChange={(e) => setEvForm((f) => ({ ...f, [field]: e.target.value }))} />
          ))}
          <textarea className={`${inputClass} min-h-20`} placeholder="Observación" value={evForm.obs} onChange={(e) => setEvForm((f) => ({ ...f, obs: e.target.value }))} />
          <button type="button" className={btnPrimaryClass} onClick={() => registrarEv.mutate()}>Registrar</button>
        </div>
      </Modal>

      <Modal open={modalSv} onClose={() => setModalSv(false)} title="Salida Varia">
        <div className="space-y-3">
          {(['tipoSv', 'numeroSv', 'numeroOrdenSv'] as const).map((field) => (
            <input key={field} className={inputClass} placeholder={field} value={svForm[field]} onChange={(e) => setSvForm((f) => ({ ...f, [field]: e.target.value }))} />
          ))}
          <textarea className={`${inputClass} min-h-20`} placeholder="Observación" value={svForm.obs} onChange={(e) => setSvForm((f) => ({ ...f, obs: e.target.value }))} />
          <button type="button" className={btnPrimaryClass} onClick={() => registrarSv.mutate()}>Registrar</button>
        </div>
      </Modal>
    </div>
  );
}
