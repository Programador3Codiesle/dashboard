'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Modal from '@/components/shared/ui/Modal';
import { useToast } from '@/components/ui/use-toast';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  inputClass,
} from '@/modules/contact-center/shared/constants/ui';
import { AuditoriaFormulario } from './AuditoriaFormulario';
import { AuditoriaIndicadoresPuntosModal } from './AuditoriaIndicadoresPuntosModal';
import {
  auditoriaContactService,
  IndicadoresPuntosResponse,
} from '../services/auditoria-contact.service';

function buildDatosInd(
  indicadores: Array<{ idIndicador: number; nombres: string; puntuacion: number }>,
) {
  return indicadores
    .map((i) => `${i.idIndicador},${i.nombres},${i.puntuacion}`)
    .join(',');
}

export function AuditoriaConfiguracionGestion() {
  const { showError, showSuccess } = useToast();
  const [modalIndicadores, setModalIndicadores] = useState(false);
  const [modalItems, setModalItems] = useState(false);
  const [modalObs, setModalObs] = useState(false);
  const [idIndicadorSel, setIdIndicadorSel] = useState<number | null>(null);
  const [idItemSel, setIdItemSel] = useState<number | null>(null);
  const [nuevoConcepto, setNuevoConcepto] = useState('');
  const [nuevaObs, setNuevaObs] = useState('');
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [nuevoIndNombre, setNuevoIndNombre] = useState('');
  const [nuevoIndPuntos, setNuevoIndPuntos] = useState('');
  const [modalPuntos, setModalPuntos] = useState(false);
  const [puntosData, setPuntosData] = useState<IndicadoresPuntosResponse | null>(null);
  const [cargandoPuntos, setCargandoPuntos] = useState(false);

  const indicadoresQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'indicadores'],
    queryFn: () => auditoriaContactService.listarIndicadores(),
    enabled: modalIndicadores || modalItems,
  });

  const itemsQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'items', idIndicadorSel],
    queryFn: () => auditoriaContactService.listarItems(idIndicadorSel!),
    enabled: modalItems && idIndicadorSel != null,
  });

  const obsQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'observaciones', idItemSel],
    queryFn: () => auditoriaContactService.listarObservaciones(idItemSel!),
    enabled: modalObs && idItemSel != null,
  });

  const formularioQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'vista-previa'],
    queryFn: () => auditoriaContactService.cargarFormularioVistaPrevia(),
    enabled: vistaPrevia,
  });

  const iniciarCambioIndicador = async (idIndicador: number, estadoActual: number) => {
    const nuevoEstado = estadoActual === 2 ? 1 : 2;
    try {
      const pendientes = await auditoriaContactService.validarAuditoriasPendientes();
      if (pendientes > 0) {
        showError('Hay auditorías pendientes; no se puede cambiar el indicador');
        return;
      }
      setCargandoPuntos(true);
      const data = await auditoriaContactService.cargarIndicadoresPuntos(
        idIndicador,
        nuevoEstado,
      );
      setPuntosData(data);
      setModalIndicadores(false);
      setModalPuntos(true);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error al cargar indicadores');
    } finally {
      setCargandoPuntos(false);
    }
  };

  const crearIndicador = useMutation({
    mutationFn: async () => {
      const indicadores = indicadoresQuery.data ?? [];
      const puntos = Number(nuevoIndPuntos);
      if (!nuevoIndNombre.trim() || puntos <= 0) {
        throw new Error('Ingrese nombre y puntos del nuevo indicador');
      }
      const sumaActual = indicadores
        .filter((i) => i.estado === 2)
        .reduce((s, i) => s + i.puntuacion, 0);
      if (sumaActual + puntos !== 100) {
        throw new Error('La suma de puntos de indicadores habilitados debe ser 100');
      }
      return auditoriaContactService.crearIndicador({
        datosInd: buildDatosInd(indicadores),
        newInd: nuevoIndNombre.trim(),
        newIndPuntos: puntos,
      });
    },
    onSuccess: () => {
      showSuccess('Indicador creado');
      setNuevoIndNombre('');
      setNuevoIndPuntos('');
      indicadoresQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  const agregarItem = useMutation({
    mutationFn: () =>
      auditoriaContactService.agregarItem({
        idIndicador: idIndicadorSel!,
        concepto: nuevoConcepto,
      }),
    onSuccess: () => {
      showSuccess('Item agregado');
      setNuevoConcepto('');
      itemsQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  const toggleItem = useMutation({
    mutationFn: async (payload: { idItem: number; estado: number }) => {
      const pendientes = await auditoriaContactService.validarAuditoriasPendientes();
      if (pendientes > 0) {
        throw new Error('Hay auditorías pendientes; no se puede cambiar el item');
      }
      return auditoriaContactService.updateItemEstado(payload);
    },
    onSuccess: () => {
      showSuccess('Item actualizado');
      itemsQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  const agregarObs = useMutation({
    mutationFn: () =>
      auditoriaContactService.agregarObservacion({
        idItem: idItemSel!,
        observacion: nuevaObs,
      }),
    onSuccess: () => {
      showSuccess('Observación agregada');
      setNuevaObs('');
      obsQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  const toggleObs = useMutation({
    mutationFn: async (payload: { idObs: number; estado: number }) => {
      const pendientes = await auditoriaContactService.validarAuditoriasPendientes();
      if (pendientes > 0) {
        throw new Error('Hay auditorías pendientes; no se puede cambiar la observación');
      }
      return auditoriaContactService.updateObservacionEstado(payload);
    },
    onSuccess: () => {
      showSuccess('Observación actualizada');
      obsQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  const sumaPuntosHabilitados = (indicadoresQuery.data ?? [])
    .filter((i) => i.estado === 2)
    .reduce((s, i) => s + i.puntuacion, 0);

  const cards = [
    { title: 'Indicadores', color: 'text-blue-600', onClick: () => setModalIndicadores(true) },
    { title: 'Items', color: 'text-gray-600', onClick: () => { setModalItems(true); setIdIndicadorSel(null); } },
    { title: 'Observaciones', color: 'text-green-600', onClick: () => { setModalObs(true); setIdItemSel(null); } },
    { title: 'Ver vista previa', color: 'text-amber-600', onClick: () => setVistaPrevia(true) },
  ];

  return (
    <div className="space-y-4">
      <nav className="text-sm text-gray-500">
        <Link href="/dashboard/contact-center/auditoria" className="hover:underline">
          Auditoría
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Configuración</span>
      </nav>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.title}
            type="button"
            onClick={c.onClick}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <h3 className={`font-semibold ${c.color}`}>{c.title}</h3>
          </button>
        ))}
      </div>

      {vistaPrevia && formularioQuery.data && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Vista previa del formulario</h3>
            <button type="button" className={btnSecondaryClass} onClick={() => setVistaPrevia(false)}>
              Cerrar
            </button>
          </div>
          <AuditoriaFormulario formulario={formularioQuery.data} readonly />
        </div>
      )}

      <Modal open={modalIndicadores} onClose={() => setModalIndicadores(false)} title="Indicadores" width="min(96vw, 800px)">
        <p className="text-xs text-gray-500 mb-3">
          Suma puntos habilitados: <strong>{sumaPuntosHabilitados}</strong> / 100
        </p>
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {(indicadoresQuery.data ?? []).map((ind) => (
            <div key={ind.idIndicador} className="flex items-center justify-between border-b py-2 text-sm gap-2">
              <span>{ind.nombres} ({ind.puntuacion} pts)</span>
              <button
                type="button"
                className={btnSecondaryClass}
                disabled={cargandoPuntos}
                onClick={() => iniciarCambioIndicador(ind.idIndicador, ind.estado)}
              >
                {ind.estado === 2 ? 'Inhabilitar' : 'Habilitar'}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t space-y-2">
          <p className="text-sm font-medium text-gray-700">Crear indicador</p>
          <div className="flex flex-wrap gap-2">
            <input
              className={inputClass}
              placeholder="Nombre"
              value={nuevoIndNombre}
              onChange={(e) => setNuevoIndNombre(e.target.value)}
            />
            <input
              type="number"
              className={`${inputClass} w-28`}
              placeholder="Puntos"
              value={nuevoIndPuntos}
              onChange={(e) => setNuevoIndPuntos(e.target.value)}
            />
            <button
              type="button"
              className={btnPrimaryClass}
              onClick={() => crearIndicador.mutate()}
              disabled={crearIndicador.isPending}
            >
              Agregar
            </button>
          </div>
        </div>
      </Modal>

      <AuditoriaIndicadoresPuntosModal
        open={modalPuntos}
        data={puntosData}
        onClose={() => {
          setModalPuntos(false);
          setPuntosData(null);
          setModalIndicadores(true);
        }}
        onSaved={() => indicadoresQuery.refetch()}
        onError={showError}
        onSuccess={showSuccess}
      />

      <Modal open={modalItems} onClose={() => setModalItems(false)} title="Items por indicador" width="min(96vw, 800px)">
        <div className="space-y-3">
          <select
            className={inputClass}
            value={idIndicadorSel ?? ''}
            onChange={(e) => setIdIndicadorSel(Number(e.target.value) || null)}
          >
            <option value="">Seleccione indicador</option>
            {(indicadoresQuery.data ?? []).map((ind) => (
              <option key={ind.idIndicador} value={ind.idIndicador}>{ind.nombres}</option>
            ))}
          </select>
          {idIndicadorSel && (
            <>
              <ul className="text-sm space-y-2 max-h-40 overflow-y-auto">
                {(itemsQuery.data ?? []).map((it) => (
                  <li key={it.idItem} className="flex items-center justify-between border-b py-1 gap-2">
                    <span>{it.concepto}</span>
                    <button
                      type="button"
                      className="text-xs text-[var(--color-primary)]"
                      onClick={() =>
                        toggleItem.mutate({
                          idItem: it.idItem,
                          estado: it.estado === 2 ? 1 : 2,
                        })
                      }
                    >
                      {it.estado === 2 ? 'Inhabilitar' : 'Habilitar'}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Nuevo concepto"
                  value={nuevoConcepto}
                  onChange={(e) => setNuevoConcepto(e.target.value)}
                />
                <button
                  type="button"
                  className={btnPrimaryClass}
                  onClick={() => agregarItem.mutate()}
                  disabled={!nuevoConcepto}
                >
                  Agregar
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal open={modalObs} onClose={() => setModalObs(false)} title="Observaciones por item" width="min(96vw, 800px)">
        <div className="space-y-3">
          <input
            type="number"
            className={inputClass}
            placeholder="Id item"
            value={idItemSel ?? ''}
            onChange={(e) => setIdItemSel(Number(e.target.value) || null)}
          />
          {idItemSel && (
            <>
              <ul className="text-sm space-y-2 max-h-40 overflow-y-auto">
                {(obsQuery.data ?? []).map((o) => (
                  <li key={o.idObs} className="flex items-center justify-between border-b py-1 gap-2">
                    <span>{o.observacion}</span>
                    <button
                      type="button"
                      className="text-xs text-[var(--color-primary)]"
                      onClick={() =>
                        toggleObs.mutate({
                          idObs: o.idObs,
                          estado: o.estado === 2 ? 1 : 2,
                        })
                      }
                    >
                      {o.estado === 2 ? 'Inhabilitar' : 'Habilitar'}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Nueva observación"
                  value={nuevaObs}
                  onChange={(e) => setNuevaObs(e.target.value)}
                />
                <button
                  type="button"
                  className={btnPrimaryClass}
                  onClick={() => agregarObs.mutate()}
                  disabled={!nuevaObs}
                >
                  Agregar
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
