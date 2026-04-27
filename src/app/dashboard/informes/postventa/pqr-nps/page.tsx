'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquareText, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  pqrNpsService,
  EstadoPqr,
  PqrNpsItem,
  GestionPqrPayload,
  GestionPqrResponse,
  VerbalizacionPayload,
  CrearPqrPayload,
} from '@/modules/informes/postventa/services/pqr-nps.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';

const PAGE_SIZE = 10;

/** Opciones del modal Nueva PQR (paridad con `informe_pqr_nps.php` legacy). */
const PQR_NUEVA_FUENTES = [
  'Exiware',
  'Interno',
  'PQR Escrita',
  'PQR Telefono',
  'PQR Verbal',
  'PQR Whatsapp',
] as const;

const PQR_NUEVA_SEDES = [
  'Girón',
  'Girón Gasolina',
  'Girón Diesel',
  'Girón LyP',
  'La Rosita',
  'Barrancabermeja',
  'Boconó Gasolina',
  'Boconó Diesel',
  'Boconó LyP',
  'Cúcuta',
] as const;

const NUEVA_PQR_LABELS_CAMPOS: Record<
  'fecha' | 'placa' | 'cliente' | 'modeloVh' | 'orden' | 'mail' | 'telefono',
  string
> = {
  fecha: 'Fecha de solicitud',
  placa: 'Placa del vehículo',
  cliente: 'NIT o CC del cliente',
  modeloVh: 'Modelo del vehículo',
  orden: 'Número de orden',
  mail: 'Correo del cliente',
  telefono: 'Teléfono del cliente',
};

/** Listas de tipificación del modal gestionar caso (`informe_pqr_nps.php` legacy). */
const TIPIF_ENCUESTA_POSTVENTA = [
  'Anonimo',
  'Calidad de producto',
  'Calidad reparacion/retorno',
  'Demora en servicio',
  'Demora repuestos',
  'Encuesta OK',
  'Falta comunicación con cliente',
  'Horarios servicio',
  'Informacion incompleta a cliente',
  'Mala atención JT',
  'Mala atención técnico',
  'Precio MO',
  'Precio repuestos',
  'Mala Atención JT',
  'Mala Atención Tecnico',
  'No hay repuestos',
  'Precio Repuestos',
  'percepción servicio',
  'Rechazo garantía',
] as const;

const TIPIF_ENCUESTA_VENTAS = [
  'Anonimo',
  'Calidad de producto',
  'Condiciones de entrega del vehìculo inadecuadas',
  'Demora en entrega',
  'Encuesta OK',
  'Falla en Accesorios Instalados',
  'Falta comunicación con cliente',
  'Información incompleta a cliente',
  'Mala atención Asesor Comercial',
  'Mala atención Entregadora',
  'No se mantiene condiciones de la negociación',
  'Ciclo del negocio largo',
  'Condiciones de crédito diferentes a las pactadas',
] as const;

const TIPIF_CIERRE_POSTVENTA = [
  'Anonimo',
  'Atencion comercial',
  'Cambio vehículo',
  'Conciliación verbal',
  'Diagnostico incompleto/incorrecto',
  'Dificil diagnostico',
  'Fallo SIC',
  'Llegada repuesto',
  'Retoma',
  'Reparado',
  'Calidad Producto',
  'percepción servicio',
  'Rechazo garantía',
] as const;

const TIPIF_CIERRE_VENTAS = [
  'Anonimo',
  'Atención comercial',
  'Cambio vehículo',
  'Conciliación verbal',
  'Diagnóstico incompleto/incorrecto',
  'Difícil diagnóstico',
  'Fallo SIC',
  'Llegada repuesto',
  'Retoma',
  'Reparado',
  'Calidad De Producto',
  'percepción servicio',
  'Rechazo garantía',
] as const;

const TIPICACION_PLACEHOLDER = 'Gestionar';

function idEncuestaParaVerb(id: unknown): number | null {
  if (id === null || id === undefined) return null;
  if (typeof id === 'bigint') {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof id === 'number' && Number.isFinite(id)) return id;
  if (typeof id === 'string' && id.trim() !== '') {
    const n = Number(id.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export default function PqrNpsPage() {
  const [estado, setEstado] = useState<EstadoPqr>('abiertos');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [gestionItem, setGestionItem] = useState<PqrNpsItem | null>(null);
  const [crearPqrOpen, setCrearPqrOpen] = useState(false);
  const [verbalizacionItem, setVerbalizacionItem] = useState<PqrNpsItem | null>(null);
  const [comentarioModal, setComentarioModal] = useState<{ open: boolean; texto: string }>({
    open: false,
    texto: '',
  });
  const [tituloComentarioModal, setTituloComentarioModal] = useState('Comentario del cliente');
  const { showError, showSuccess, showInfo } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PqrNpsItem[], Error>({
    queryKey: ['pqr-nps', estado],
    queryFn: () => pqrNpsService.listar(estado),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: tecnicos = [] } = useQuery({
    queryKey: ['pqr-nps-tecnicos'],
    queryFn: () => pqrNpsService.listarTecnicos(),
    staleTime: 1000 * 60 * 5,
  });

  const guardarGestion = useMutation({
    mutationFn: (payload: GestionPqrPayload) => pqrNpsService.guardarGestion(payload),
    retry: false,
    onSuccess: async () => {
      showSuccess('Caso gestionado correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['pqr-nps'] });
      setGestionItem(null);
    },
    onError: () => showError('No se pudo guardar la gestión del caso.'),
  });

  const crearPqr = useMutation({
    mutationFn: (payload: CrearPqrPayload) => pqrNpsService.crearPqr(payload),
    retry: false,
    onSuccess: async () => {
      showSuccess('PQR creada correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['pqr-nps'] });
      setCrearPqrOpen(false);
    },
    onError: () => showError('No se pudo crear la PQR.'),
  });

  const cerrarCrearPqrModal = useCallback(() => setCrearPqrOpen(false), []);
  const guardarCrearPqr = useCallback(
    (payload: CrearPqrPayload) => {
      crearPqr.mutate(payload);
    },
    [crearPqr.mutate],
  );

  const crearVerbalizacion = useMutation({
    mutationFn: (payload: VerbalizacionPayload) => pqrNpsService.crearVerbalizacion(payload),
    onSuccess: async () => {
      showSuccess('Verbalización guardada correctamente.');
      if (verbalizacionItem != null) {
        const vid = idEncuestaParaVerb(verbalizacionItem.id);
        if (vid != null) {
          await queryClient.invalidateQueries({ queryKey: ['pqr-nps-verbalizaciones', vid] });
        }
      }
      setVerbalizacionItem(null);
    },
    onError: () => showError('No se pudo guardar la verbalización.'),
  });

  const { data: gestionActual, isPending: gestionCargando, isError: gestionQueryError } = useQuery({
    queryKey: ['pqr-nps-gestion', gestionItem?.fuente, gestionItem?.id],
    queryFn: () => {
      const id = idEncuestaParaVerb(gestionItem!.id);
      if (id == null) return Promise.resolve(null);
      return pqrNpsService.obtenerGestion(gestionItem!.fuente, id);
    },
    enabled: Boolean(gestionItem),
    retry: false,
  });

  const modoGestionModal: 'loading' | 'error' | 'sin-registro' | 'con-registro' = gestionCargando
    ? 'loading'
    : gestionQueryError
    ? 'error'
    : gestionActual === null
    ? 'sin-registro'
    : 'con-registro';

  const keyGestionModal =
    gestionItem != null
      ? `${gestionItem.fuente}-${gestionItem.id}-${
          modoGestionModal === 'loading'
            ? 'loading'
            : modoGestionModal === 'error'
            ? 'error'
            : gestionActual?.id ?? 'sin-registro'
        }`
      : '';

  const verbalizacionId = verbalizacionItem != null ? idEncuestaParaVerb(verbalizacionItem.id) : null;

  const { data: verbalizaciones = [] } = useQuery({
    queryKey: ['pqr-nps-verbalizaciones', verbalizacionId],
    queryFn: () => pqrNpsService.listarVerbalizaciones(verbalizacionId!),
    enabled: verbalizacionId != null,
  });

  const itemsFiltrados = useMemo(() => {
    const all = data ?? [];
    const estadoPrioridad = (estadoCaso: string | null | undefined) => {
      const normalizado = (estadoCaso ?? 'Gestionar').trim().toLowerCase();
      if (normalizado === 'abierto') return 0;
      if (normalizado === 'gestionar') return 1;
      return 2;
    };

    const ordenarPorEstado = (rows: PqrNpsItem[]) =>
      [...rows].sort((a, b) => estadoPrioridad(a.estadoCaso) - estadoPrioridad(b.estadoCaso));

    if (!filtroTexto.trim()) return ordenarPorEstado(all);
    const term = filtroTexto.trim().toLowerCase();
    const filtrados = all.filter((row) =>
      [row.fuente, row.sede, row.placa, row.cliente, row.tecnico, row.estadoCaso, row.tipificacionEncuesta]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
    return ordenarPorEstado(filtrados);
  }, [data, filtroTexto]);

  const totalPages = Math.max(1, Math.ceil(itemsFiltrados.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return itemsFiltrados.slice(start, start + PAGE_SIZE);
  }, [itemsFiltrados, currentPage]);

  useEffect(() => {
    if (error) {
      showError('No se pudo cargar el informe de PQR.');
    }
  }, [error, showError]);

  const exportarExcel = () => {
    if (itemsFiltrados.length === 0) {
      showInfo('No hay registros para exportar.');
      return;
    }
    const rows = itemsFiltrados.map((r) => ({
      Fuente: r.fuente,
      'Id encuesta': r.id,
      Sede: r.sede ?? '',
      Área: r.area ?? '',
      Fecha: r.fecha ?? '',
      Placa: r.placa ?? '',
      Cliente: r.cliente ?? '',
      Técnico: r.tecnico ?? '',
      'Estado del caso': r.estadoCaso ?? '',
      'Tipificación encuesta': r.tipificacionEncuesta ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PQR-NPS');
    XLSX.writeFile(workbook, `pqr-nps-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">Informe PQR / NPS</h1>
          <p className="text-gray-500 text-sm mt-1">
            Listado consolidado de PQR abiertos y cerrados provenientes de encuestas GM, PQR Codíesel y encuestas internas.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6 flex flex-col md:flex-row md:items-end gap-4 md:justify-between w-full max-w-5xl">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Estado del caso</p>
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as EstadoPqr);
              setCurrentPage(1);
            }}
            className="rounded-md border border-gray-300 text-sm px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
          >
            <option value="abiertos">Abiertos</option>
            <option value="cerrados">Cerrados</option>
            <option value="todos">Todos</option>
          </select>
        </div>
        <div className="w-full md:w-80">
          <p className="text-xs font-medium text-gray-500 mb-1">Filtro rápido</p>
          <input
            value={filtroTexto}
            onChange={(e) => {
              setFiltroTexto(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Fuente, placa, cliente, técnico..."
            className="w-full rounded-md border border-gray-300 text-sm px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
          />
        </div>

        <div className="text-xs text-gray-500">
          {isLoading ? 'Cargando registros...' : `Total registros: ${itemsFiltrados.length}`}
        </div>
        <div className="flex gap-2 md:ml-auto">
          <button type="button" onClick={() => setCrearPqrOpen(true)} className="px-3 py-2 text-sm rounded-md brand-btn">
            Agregar PQR
          </button>
          <button
            type="button"
            onClick={exportarExcel}
            className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border overflow-auto">
        <table className="min-w-full text-xs">
          <thead className="brand-bg text-white">
            <tr>
              <th className="px-2 py-2 text-left">Acción</th>
              <th className="px-2 py-2 text-left">Fuente</th>
              <th className="px-2 py-2 text-left">Id encuesta</th>
              <th className="px-2 py-2 text-left">Sede</th>
              <th className="px-2 py-2 text-left">Área</th>
              <th className="px-2 py-2 text-left">Fecha</th>
              <th className="px-2 py-2 text-left">Placa</th>
              <th className="px-2 py-2 text-left">Cliente</th>
              <th className="px-2 py-2 text-left">Modelo VH</th>
              <th className="px-2 py-2 text-left"># Orden</th>
              <th className="px-2 py-2 text-left">Mail</th>
              <th className="px-2 py-2 text-left">Teléfono</th>
              <th className="px-2 py-2 text-left">Servicio</th>
              <th className="px-2 py-2 text-left">Vehículo Reparado correctamente</th>
              <th className="px-2 py-2 text-left">Satisfacción con el trabajo realizado</th>
              <th className="px-2 py-2 text-left">Visita de servicio</th>
              <th className="px-2 py-2 text-left">Recomendación de la Marca</th>
              <th className="px-2 py-2 text-left">Comentarios de los Clientes</th>
              <th className="px-2 py-2 text-left">Técnico</th>
              <th className="px-2 py-2 text-left">Tipificación Encuesta</th>
              <th className="px-2 py-2 text-left">Contacto con el cliente</th>
              <th className="px-2 py-2 text-left">Estado del Caso</th>
              <th className="px-2 py-2 text-left">Comentarios final caso</th>
              <th className="px-2 py-2 text-left">Tipificación cierre</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row, index) => (
              <tr
                key={`${row.fuente}-${row.id}-${row.orden ?? ''}-${row.placa ?? ''}-${index}`}
                className={`border-b last:border-b-0 ${
                  (row.estadoCaso ?? 'Gestionar').trim().toLowerCase() === 'gestionar'
                    ? 'bg-amber-50'
                    : row.estadoCaso === 'Cerrado'
                    ? 'bg-white'
                    : ''
                }`}
              >
                <td className="px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setGestionItem(row)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white brand-bg hover:opacity-90 transition-all duration-150 shadow-sm mr-2 active:scale-95 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary-ring]"
                  >
                    Gestionar
                  </button>
                </td>
                <td className="px-2 py-1">{row.fuente}</td>
                <td className="px-2 py-1">{row.id}</td>
                <td className="px-2 py-1">{row.sede}</td>
                <td className="px-2 py-1">{row.area}</td>
                <td className="px-2 py-1">{row.fecha}</td>
                <td className="px-2 py-1">{row.placa}</td>
                <td className="px-2 py-1">{row.cliente}</td>
                <td className="px-2 py-1">{row.modeloVh}</td>
                <td className="px-2 py-1">{row.orden}</td>
                <td className="px-2 py-1">{row.mail}</td>
                <td className="px-2 py-1">{row.telefono}</td>
                <td className="px-2 py-1 text-center">{row.servicio ?? ''}</td>
                <td className="px-2 py-1 text-center">{row.satisfaccionConcesionario ?? ''}</td>
                <td className="px-2 py-1 text-center">{row.satisfaccionTrabajo ?? ''}</td>
                <td className="px-2 py-1 text-center">{row.vhReparadoOk ?? ''}</td>
                <td className="px-2 py-1 text-center">{row.recomendacionMarca ?? ''}</td>
                <td className="px-2 py-1">
                  <button
                    type="button"
                    onClick={() =>
                      {
                        setTituloComentarioModal('Comentario del cliente');
                        setComentarioModal({
                          open: true,
                          texto: row.comentarios?.trim() || 'Sin comentarios del cliente para este registro.',
                        });
                      }
                    }
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md border brand-border brand-text hover:brand-bg hover:text-yellow-400 transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary-ring]"
                    aria-label="Ver comentario del cliente"
                    title="Ver comentario"
                  >
                    <MessageSquareText size={14} />
                    <span className="text-xs font-medium">Ver</span>
                  </button>
                </td>
                <td className="px-2 py-1">{row.tecnico}</td>
                <td className="px-2 py-1">{row.tipificacionEncuesta ?? 'Gestionar'}</td>
                <td className="px-2 py-1">
                  <div className="flex items-center gap-2">
                    <span>{row.contactoCliente ?? ''}</span>
                    <button
                      type="button"
                      onClick={() => setVerbalizacionItem(row)}
                      disabled={idEncuestaParaVerb(row.id) === null}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border brand-border brand-text hover:brand-bg hover:text-yellow-400 transition-all duration-150 active:scale-95 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary-ring] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current disabled:active:scale-100"
                    >
                      Verb
                    </button>
                  </div>
                </td>
                <td className="px-2 py-1">{row.estadoCaso ?? 'Gestionar'}</td>
                <td className="px-2 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTituloComentarioModal('Comentario final del caso');
                      setComentarioModal({
                        open: true,
                        texto: row.comentariosFinalCaso?.trim() || 'Sin comentario final para este caso.',
                      });
                    }}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md border brand-border brand-text hover:brand-bg hover:text-yellow-400 transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary-ring]"
                    aria-label="Ver comentario final del caso"
                    title="Ver comentario final"
                  >
                    <MessageSquareText size={14} />
                    <span className="text-xs font-medium">Ver</span>
                  </button>
                </td>
                <td className="px-2 py-1">{row.tipificacionCierre ?? 'Gestionar'}</td>
              </tr>
            ))}

            {!isLoading && itemsFiltrados.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500 text-sm" colSpan={24}>
                  No hay registros para el estado seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />}

      {gestionItem && (
        <GestionModal
          key={keyGestionModal}
          item={gestionItem}
          modo={modoGestionModal}
          registro={modoGestionModal === 'con-registro' && gestionActual != null ? gestionActual : null}
          onClose={() => setGestionItem(null)}
          onSave={(payload) => guardarGestion.mutate(payload)}
          isSaving={guardarGestion.isPending}
        />
      )}

      {crearPqrOpen && (
        <CrearPqrModal
          tecnicos={tecnicos}
          onClose={cerrarCrearPqrModal}
          onSave={guardarCrearPqr}
          isSaving={crearPqr.isPending}
        />
      )}

      {verbalizacionItem && (
        <VerbalizacionModal
          item={verbalizacionItem}
          data={verbalizaciones}
          onClose={() => setVerbalizacionItem(null)}
          onSave={(payload) => crearVerbalizacion.mutate(payload)}
          isSaving={crearVerbalizacion.isPending}
        />
      )}

      {comentarioModal.open && (
        <ComentarioModal
          titulo={tituloComentarioModal}
          comentario={comentarioModal.texto}
          onClose={() => {
            setComentarioModal({ open: false, texto: '' });
            setTituloComentarioModal('Comentario del cliente');
          }}
        />
      )}
    </div>
  );
}

function GestionModal({
  item,
  modo,
  registro,
  onClose,
  onSave,
  isSaving,
}: {
  item: PqrNpsItem;
  modo: 'loading' | 'error' | 'sin-registro' | 'con-registro';
  registro: GestionPqrResponse | null;
  onClose: () => void;
  onSave: (payload: GestionPqrPayload) => void;
  isSaving: boolean;
}) {
  const { showError } = useToast();
  const encuestaOpciones = (pv: 1 | 2) =>
    pv === 1 ? TIPIF_ENCUESTA_POSTVENTA : TIPIF_ENCUESTA_VENTAS;
  const cierreOpciones = (pv: 1 | 2) => (pv === 1 ? TIPIF_CIERRE_POSTVENTA : TIPIF_CIERRE_VENTAS);

  const [postVenta, setPostVenta] = useState<1 | 2>((registro?.postVenta as 1 | 2) ?? 1);
  const [tipificacionEncuesta, setTipificacionEncuesta] = useState(
    (registro?.tipificacionEncuesta ?? '').trim() || '',
  );
  const [estadoCaso, setEstadoCaso] = useState<'Abierto' | 'Cerrado'>(
    (registro?.estadoCaso as 'Abierto' | 'Cerrado') ?? 'Abierto',
  );
  const [tipificacionCierre, setTipificacionCierre] = useState(
    (registro?.tipificacionCierre ?? '').trim() || '',
  );
  const [comentariosFinalCaso, setComentariosFinalCaso] = useState(registro?.comentariosFinalCaso ?? '');
  const esGestionarActual =
    ((item.estadoCaso ?? TIPICACION_PLACEHOLDER).trim().toLowerCase() ===
      TIPICACION_PLACEHOLDER.toLowerCase());

  useEffect(() => {
    if (modo !== 'sin-registro' || esGestionarActual) return;
    setTipificacionEncuesta('');
  }, [postVenta, modo, esGestionarActual]);

  const fieldClass =
    'w-full rounded-md border border-gray-200 bg-white p-2 text-sm text-gray-900 focus-visible:border-gray-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-200';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  const guardar = () => {
    const idFuente = idEncuestaParaVerb(item.id);
    if (idFuente == null) {
      showError('No se pudo determinar el id del caso.');
      return;
    }
    const tecnico = (item.tecnico ?? '').trim() || 'SIN DEFINIR';
    const requiereTipificaciones = !esGestionarActual;
    const tipEncRegistro = (registro?.tipificacionEncuesta ?? '').trim();
    const tipCierreRegistro = (registro?.tipificacionCierre ?? '').trim();
    const tipEnc = requiereTipificaciones
      ? tipificacionEncuesta.trim() || tipEncRegistro
      : TIPICACION_PLACEHOLDER;
    const tipCierre = requiereTipificaciones
      ? tipificacionCierre.trim() || tipCierreRegistro
      : TIPICACION_PLACEHOLDER;

    if (requiereTipificaciones && !tipEnc) {
      showError('Seleccione la tipificación de encuesta.');
      return;
    }
    if (requiereTipificaciones && !tipCierre) {
      showError('Seleccione la tipificación de cierre.');
      return;
    }

    onSave({
      fuente: item.fuente,
      idFuente,
      postVenta: ((registro?.postVenta as 1 | 2) ?? postVenta),
      tecnico,
      tipificacionEncuesta: tipEnc,
      estadoCaso,
      comentariosFinalCaso: comentariosFinalCaso.trim(),
      tipificacionCierre: tipCierre,
    });
  };

  if (modo === 'loading') {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-xl p-6 text-center text-sm text-gray-600">
          Cargando datos del caso…
        </div>
      </div>
    );
  }

  if (modo === 'error') {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-xl p-4 space-y-3">
          <h3 className="font-semibold brand-text">Gestionar caso</h3>
          <p className="text-sm text-gray-600">No se pudieron cargar los datos de gestión. Intente de nuevo.</p>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md brand-btn">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-xl p-4 space-y-3 max-h-[90vh] overflow-auto">
        <h3 className="font-semibold brand-text">Gestionar caso {item.fuente}-{item.id}</h3>

        {esGestionarActual ? (
          <p className="text-xs text-gray-500">
            Caso en estado Gestionar: complete área, estado y comentario para actualizarlo.
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            Caso en estado abierto/cerrado: puede actualizar tipificaciones, estado y comentario final.
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label className={labelClass}>Área</label>
            <select
              value={postVenta}
              disabled={modo === 'con-registro'}
              onChange={(e) => setPostVenta(Number(e.target.value) as 1 | 2)}
              className={fieldClass}
            >
              <option value={1}>POSTVENTA</option>
              <option value={2}>VENTAS</option>
            </select>
          </div>

          {!esGestionarActual && (
            <div>
              <label className={labelClass}>
                {postVenta === 1 ? 'Tipificación encuesta postventa' : 'Tipificación encuesta ventas'}
              </label>
              <select
                value={tipificacionEncuesta}
                onChange={(e) => setTipificacionEncuesta(e.target.value)}
                className={fieldClass}
              >
                <option value="">Seleccione una opción…</option>
                {tipificacionEncuesta &&
                  !(encuestaOpciones(postVenta) as readonly string[]).includes(tipificacionEncuesta) && (
                    <option value={tipificacionEncuesta}>{tipificacionEncuesta}</option>
                  )}
                {encuestaOpciones(postVenta).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Estado del caso</label>
            <select
              value={estadoCaso}
              onChange={(e) => setEstadoCaso(e.target.value as 'Abierto' | 'Cerrado')}
              className={fieldClass}
            >
              <option value="Abierto">Abierto</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          {!esGestionarActual && (
            <div>
              <label className={labelClass}>
                {postVenta === 1 ? 'Tipificación cierre postventa' : 'Tipificación cierre ventas'}
              </label>
              <select
                value={tipificacionCierre}
                onChange={(e) => setTipificacionCierre(e.target.value)}
                className={fieldClass}
              >
                <option value="">Seleccione una opción…</option>
                {tipificacionCierre &&
                  !(cierreOpciones(postVenta) as readonly string[]).includes(tipificacionCierre) && (
                    <option value={tipificacionCierre}>{tipificacionCierre}</option>
                  )}
                {cierreOpciones(postVenta).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Comentarios finales del caso</label>
            <textarea
              value={comentariosFinalCaso}
              onChange={(e) => setComentariosFinalCaso(e.target.value)}
              rows={4}
              className={fieldClass}
              placeholder="Comentarios finales del caso"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">
            Cerrar
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={guardar}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md brand-btn disabled:opacity-50"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const CrearPqrModal = memo(function CrearPqrModal({
  tecnicos,
  onClose,
  onSave,
  isSaving,
}: {
  tecnicos: { documento: string; nombre: string }[];
  onClose: () => void;
  onSave: (payload: CrearPqrPayload) => void;
  isSaving: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const envioEnCursoRef = useRef(false);
  const { showError } = useToast();

  useEffect(() => {
    if (!isSaving) envioEnCursoRef.current = false;
  }, [isSaving]);

  const tecnicosOrdenados = useMemo(
    () =>
      [...tecnicos].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }),
      ),
    [tecnicos],
  );

  const setCampoSiHayValor = (name: keyof CrearPqrPayload, valor: string | undefined | null) => {
    if (valor == null || String(valor).trim() === '') return;
    const form = formRef.current;
    if (!form) return;
    const el = form.elements.namedItem(name as string) as HTMLInputElement | null;
    if (el) el.value = String(valor);
  };

  const buscarVehiculo = async () => {
    const form = formRef.current;
    if (!form) return;
    const placa = (form.elements.namedItem('placa') as HTMLInputElement | null)?.value?.trim();
    if (!placa) return;
    const info = await pqrNpsService.obtenerInfoVehiculo(placa);
    if (!info) return;
    setCampoSiHayValor('cliente', info.nit);
    setCampoSiHayValor('modeloVh', info.modelo);
    setCampoSiHayValor('mail', info.mail);
    setCampoSiHayValor('telefono', info.celular);
  };

  const buscarCliente = async () => {
    const form = formRef.current;
    if (!form) return;
    const cliente = (form.elements.namedItem('cliente') as HTMLInputElement | null)?.value?.trim();
    if (!cliente) return;
    await pqrNpsService.obtenerClientePorNit(cliente);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving || envioEnCursoRef.current) return;
    envioEnCursoRef.current = true;
    const form = formRef.current;
    if (!form) {
      envioEnCursoRef.current = false;
      return;
    }
    const fd = new FormData(form);
    const payload: CrearPqrPayload = {
      fuente: String(fd.get('fuente') ?? '').trim(),
      sede: String(fd.get('sede') ?? '').trim(),
      fecha: String(fd.get('fecha') ?? '').trim(),
      placa: String(fd.get('placa') ?? '').trim(),
      cliente: String(fd.get('cliente') ?? '').trim(),
      modeloVh: String(fd.get('modeloVh') ?? '').trim(),
      orden: String(fd.get('orden') ?? '').trim(),
      mail: String(fd.get('mail') ?? '').trim(),
      telefono: String(fd.get('telefono') ?? '').trim(),
      tecnico: String(fd.get('tecnico') ?? '').trim(),
      comentarios: String(fd.get('comentarios') ?? '').trim(),
    };

    const tieneCamposPendientes = Object.values(payload).some((value) => value === '');
    if (tieneCamposPendientes) {
      showError('Debe llenar todos los campos.');
      envioEnCursoRef.current = false;
      return;
    }

    onSave(payload);
  };

  const inputClass =
    'w-full rounded-md border border-gray-200 bg-white p-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-gray-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-200';

  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl p-4 space-y-3 max-h-[90vh] overflow-auto">
        <h3 className="font-semibold brand-text">Nueva PQR</h3>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="nueva-pqr-fuente" className={labelClass}>
                Seleccione una fuente
              </label>
              <select
                id="nueva-pqr-fuente"
                name="fuente"
                defaultValue=""
                className={inputClass}
              >
                <option value="">Seleccione una opción...</option>
                {PQR_NUEVA_FUENTES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="nueva-pqr-sede" className={labelClass}>
                Seleccione una sede
              </label>
              <select
                id="nueva-pqr-sede"
                name="sede"
                defaultValue=""
                className={inputClass}
              >
                <option value="">Seleccione una opción...</option>
                {PQR_NUEVA_SEDES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {(['fecha', 'placa', 'cliente', 'modeloVh', 'orden', 'mail', 'telefono'] as const).map((key) => (
              <div key={key}>
                <label htmlFor={`nueva-pqr-${key}`} className={labelClass}>
                  {NUEVA_PQR_LABELS_CAMPOS[key]}
                </label>
                <input
                  id={`nueva-pqr-${key}`}
                  name={key}
                  placeholder={NUEVA_PQR_LABELS_CAMPOS[key]}
                  className={inputClass}
                  type={key === 'fecha' ? 'date' : 'text'}
                  autoComplete="off"
                  onBlur={key === 'placa' ? buscarVehiculo : key === 'cliente' ? buscarCliente : undefined}
                />
              </div>
            ))}
            <div>
              <label htmlFor="nueva-pqr-tecnico" className={labelClass}>
                Técnico o asesor
              </label>
              <select id="nueva-pqr-tecnico" name="tecnico" defaultValue="" className={inputClass}>
                <option value="">Seleccione una opción...</option>
                {tecnicosOrdenados.map((tec) => (
                  <option key={`${tec.documento}-${tec.nombre}`} value={tec.documento}>
                    {tec.nombre} - {tec.documento}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="nueva-pqr-comentarios" className={labelClass}>
              Comentarios del cliente
            </label>
            <textarea
              id="nueva-pqr-comentarios"
              name="comentarios"
              rows={4}
              placeholder="Comentarios del cliente"
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md brand-btn disabled:opacity-50"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

function VerbalizacionModal({
  item,
  data,
  onClose,
  onSave,
  isSaving,
}: {
  item: PqrNpsItem;
  data: { contacto: string; verbalizacion: string; fechaContacto: string }[];
  onClose: () => void;
  onSave: (payload: VerbalizacionPayload) => void;
  isSaving: boolean;
}) {
  const [contacto, setContacto] = useState('');
  const [verbalizacion, setVerbalizacion] = useState('');
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl p-4 space-y-3">
        <h3 className="font-semibold brand-text">Verbalizaciones {item.fuente}-{item.id}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="Nombre de contacto" className="border rounded-md p-2 text-sm" />
          <input value={verbalizacion} onChange={(e) => setVerbalizacion(e.target.value)} placeholder="Verbalización" className="border rounded-md p-2 text-sm" />
        </div>
        <button
          type="button"
          disabled={isSaving || idEncuestaParaVerb(item.id) === null}
          onClick={() => {
            const vid = idEncuestaParaVerb(item.id);
            if (vid != null) onSave({ idPqrNps: vid, contacto, verbalizacion });
          }}
          className="px-3 py-2 text-sm rounded-md brand-btn disabled:opacity-50"
        >
          Agregar verbalización
        </button>
        <div className="max-h-60 overflow-auto border rounded-md">
          <table className="w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Contacto</th>
                <th className="text-left p-2">Verbalización</th>
                <th className="text-left p-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v, idx) => (
                <tr key={`${v.contacto}-${v.fechaContacto}-${idx}`} className="border-t">
                  <td className="p-2">{v.contacto}</td>
                  <td className="p-2">{v.verbalizacion}</td>
                  <td className="p-2">{String(v.fechaContacto).slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm border rounded-md">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function ComentarioModal({
  titulo,
  comentario,
  onClose,
}: {
  titulo: string;
  comentario: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border brand-border overflow-hidden">
        <div className="brand-bg text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareText size={18} />
            <h3 className="text-sm md:text-base font-semibold">{titulo}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Cerrar modal de comentario"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 leading-relaxed max-h-[50vh] overflow-auto whitespace-pre-wrap">
            {comentario}
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md brand-btn transition-all duration-150 active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

