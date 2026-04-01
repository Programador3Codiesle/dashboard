'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Car } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import {
  checklistCarroService,
  ChecklistCarro,
} from "@/modules/informes/gestion-humana/services/checklist-carro.service";
import Modal from "@/components/shared/ui/Modal";
import { Pagination } from "@/components/shared/ui/Pagination";

const PAGE_SIZE = 10;

/** Cantidad de columnas igual al legacy `informe_checklist_carros/index.php` (80 `<th>`). */
const TABLE_COL_COUNT = 80;

/** API puede devolver ISO (`2031-06-03T00:00:00.000Z`) o `YYYY-MM-DD`. */
function formatDateOnly(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return "";
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

const SEDES = [
  { value: "", label: "Todas las sedes" },
  { value: "Giron", label: "Girón" },
  { value: "Rosita", label: "Rosita" },
  { value: "Bocono", label: "Bocono" },
  { value: "Malecon", label: "Malecon" },
  { value: "Barranca", label: "Barranca" },
  { value: "Otra", label: "Otra" },
];

export default function ChecklistCarroPage() {
  const { showError, showInfo } = useToast();

  const [fechaIni, setFechaIni] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [sede, setSede] = useState("");
  const [appliedFechaIni, setAppliedFechaIni] = useState("");
  const [appliedFechaFin, setAppliedFechaFin] = useState("");
  const [appliedSede, setAppliedSede] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ChecklistCarro[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const requestIdRef = useRef(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalId, setModalId] = useState<number | null>(null);

  const baseImgUrl =
    "https://intranet.codiesel.co/ventas/images/log_img_novedades_check";

  const hasAppliedSearch =
    !!(appliedFechaIni || appliedFechaFin || appliedSede);

  const data = useMemo(() => rows, [rows]);
  const showInitialLoader = loading && data.length === 0;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)),
    [totalItems],
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!hasAppliedSearch) {
        requestIdRef.current += 1;
        setRows([]);
        setTotalItems(0);
        setLoading(false);
        return;
      }

      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const result = await checklistCarroService.listar({
          fechaIni: appliedFechaIni || undefined,
          fechaFin: appliedFechaFin || undefined,
          sede: appliedSede || undefined,
          pagina: currentPage,
          limite: PAGE_SIZE,
        });

        if (requestId === requestIdRef.current) {
          setRows(result.items);
          setTotalItems(result.total);
          if (result.items.length === 0) {
            showInfo("No hay datos para mostrar con los filtros seleccionados.");
          }
        }
      } catch (err) {
        console.error(err);
        if (requestId === requestIdRef.current) {
          showError("No se pudo cargar el informe de checklist carros.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [appliedFechaIni, appliedFechaFin, appliedSede, currentPage, hasAppliedSearch, showError, showInfo]);

  const handleFiltrar = () => {
    if (!fechaIni && !fechaFin && !sede) {
      showError("Por favor ingrese al menos fechas o sede para filtrar.");
      return;
    }

    setAppliedFechaIni(fechaIni);
    setAppliedFechaFin(fechaFin);
    setAppliedSede(sede);
    setCurrentPage(1);
  };

  const openImagesModal = (id: number) => {
    setModalId(id);
    setModalOpen(true);
  };

  const renderSiNo = (value: number) => (value === 1 ? "Sí" : "No");

  /** Cabeceras angostas; títulos largos hacen salto de línea. */
  const th =
    "text-center py-1.5 px-1 text-[10px] leading-tight font-semibold text-white align-top max-w-[4.75rem] min-w-0 w-[4.75rem] box-border whitespace-normal break-words [word-break:break-word]";
  const td =
    "min-w-0 px-1 py-0.5 text-[10px] text-center align-middle whitespace-normal break-words [word-break:break-word]";
  const tdObs =
    "px-1 py-0.5 text-left align-middle text-[10px] max-w-[4.75rem] min-w-0 w-[4.75rem] break-words whitespace-normal [word-break:break-word]";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Informe Check List Carros
          </h1>
          <p className="text-gray-500 mt-1">
            Consulta y exporta las inspecciones de checklist de vehículos por rango de
            fechas y sede.
          </p>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fecha inicial
            </label>
            <input
              type="date"
              value={fechaIni}
              onChange={(e) => setFechaIni(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fecha final
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Sede</label>
            <select
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white"
            >
              {SEDES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={handleFiltrar}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Car size={20} className="text-(--color-primary)" />
            <h2 className="text-base font-semibold text-gray-900">
              Resultados checklist carros
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {hasAppliedSearch && totalItems > 0 && (
              <span className="text-xs text-gray-500">
                {totalItems} registro{totalItems === 1 ? "" : "s"}
              </span>
            )}
            {hasAppliedSearch && loading && !showInitialLoader && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="animate-spin" size={14} />
                Actualizando...
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
        <table className="table-fixed w-full min-w-[6080px] text-xs">
          <thead className="brand-bg border-b border-(--color-primary-dark)">
            <tr>
              <th className={th}>Tipo Vehículo</th>
              <th className={th}>Placa</th>
              <th className={th}>Fecha</th>
              <th className={th}>Sede</th>
              <th className={th}>Conductor</th>
              <th className={th}>Doc. Conductor</th>
              <th className={th}>Tiene Licencia</th>
              <th className={th}>Categoría Licencia</th>
              <th className={th}>Fecha Vencimiento Licencia</th>
              <th className={th}>Observación Licencia</th>
              <th className={th}>Porta Documentos</th>
              <th className={th}>Observación Documentos</th>
              <th className={th}>Solicitud Prueba Ruta</th>
              <th className={th}>Asesor</th>
              <th className={th}>Cliente</th>
              <th className={th}>Cel. Cliente</th>
              <th className={th}>Fecha Vencimiento Tecnicomecanica</th>
              <th className={th}>Tecno</th>
              <th className={th}>Observación Tecnicomecanica</th>
              <th className={th}>Fecha Vencimiento SOAT</th>
              <th className={th}>SOAT</th>
              <th className={th}>Observación SOAT</th>
              <th className={th}>Direccionales Delanteras</th>
              <th className={th}>Observación Direccionales Delanteras</th>
              <th className={th}>Direccionales Traseras</th>
              <th className={th}>Observación Direccionales Traseras</th>
              <th className={th}>Luces Altas</th>
              <th className={th}>Observación Luces Altas</th>
              <th className={th}>Luces Bajas</th>
              <th className={th}>Observación Luces Bajas</th>
              <th className={th}>Stops</th>
              <th className={th}>Observación Stops</th>
              <th className={th}>Luces de Reversa</th>
              <th className={th}>Observación Luces de Reversa</th>
              <th className={th}>Luces de Parqueo</th>
              <th className={th}>Observación Luces de Parqueo</th>
              <th className={th}>Luces Internas</th>
              <th className={th}>Observación Luces Internas</th>
              <th className={th}>Limpia Parabrisas</th>
              <th className={th}>Observación Limpia Parabrisas</th>
              <th className={th}>Pito</th>
              <th className={th}>Observación Pito</th>
              <th className={th}>Sistema de Dirección</th>
              <th className={th}>Observación Sistema de Dirección</th>
              <th className={th}>Cinturones</th>
              <th className={th}>Observación Cinturones</th>
              <th className={th}>Airbag</th>
              <th className={th}>Observación Airbag</th>
              <th className={th}>Frenos Principales</th>
              <th className={th}>Observación Frenos Principales</th>
              <th className={th}>Frenos Emergencia</th>
              <th className={th}>Observación Frenos Emergencia</th>
              <th className={th}>Llantas</th>
              <th className={th}>Observación Llantas</th>
              <th className={th}>Llanta Repuesto</th>
              <th className={th}>Observación Llanta Repuesto</th>
              <th className={th}>Espejos</th>
              <th className={th}>Observación Espejos</th>
              <th className={th}>Nivel Fluidos Frenos</th>
              <th className={th}>Observación Nivel Fluidos Frenos</th>
              <th className={th}>Nivel Fluidos Aceite</th>
              <th className={th}>Observación Nivel Fluidos Aceite</th>
              <th className={th}>Nivel Fluidos Refrigerante</th>
              <th className={th}>Observación Nivel Fluidos Refrigerante</th>
              <th className={th}>Extintor</th>
              <th className={th}>Fecha Vencimiento Extintor</th>
              <th className={th}>Observación Extintor</th>
              <th className={th}>Kit Carretera</th>
              <th className={th}>Observación Kit Carretera</th>
              <th className={th}>Botiquín</th>
              <th className={th}>Observación Botiquín</th>
              <th className={th}>Quinta Rueda</th>
              <th className={th}>Observación Quinta Rueda</th>
              <th className={th}>Mangueras</th>
              <th className={th}>Observación Mangueras</th>
              <th className={th}>Nivel Combustible</th>
              <th className={th}>Kilometraje Salida</th>
              <th className={th}>Kilometraje Llegada</th>
              <th className={th}>Observación General</th>
              <th className={`${th} w-21 max-w-21`}>Ver Imágenes</th>
            </tr>
          </thead>
          <tbody>
            {showInitialLoader ? (
              <tr>
                <td colSpan={TABLE_COL_COUNT} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Cargando datos...</span>
                  </div>
                </td>
              </tr>
            ) : !hasAppliedSearch ? (
              <tr>
                <td colSpan={TABLE_COL_COUNT} className="text-center py-10 text-gray-500">
                  No hay datos para mostrar. Ingrese filtros y pulse Filtrar.
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={TABLE_COL_COUNT} className="text-center py-10 text-gray-500">
                  No hay datos para mostrar con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              data.map((r, idx) => (
                <tr
                  key={`${r.id}-${r.placa}-${r.fecha}-${idx}`}
                  className="border-b border-gray-100 hover:bg-gray-50/60"
                >
                  <td className={`${td}`}>{r.tipo_vh}</td>
                  <td className={`${td}`}>{r.placa}</td>
                  <td className={`${td}`}>{formatDateOnly(r.fecha)}</td>
                  <td className={`${td}`}>{r.sede}</td>
                  <td className={`${td}`}>{r.conductor}</td>
                  <td className={`${td}`}>{r.doc_conductor}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.lic_conduccion))}</td>
                  <td className={`${td}`}>{r.categoria_lic ?? ""}</td>
                  <td className={`${td}`}>
                    {formatDateOnly(r.fec_vence_lic ?? undefined)}
                  </td>
                  <td className={tdObs}>{r.observacion_lic ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.porta_documentos))}</td>
                  <td className={tdObs}>{r.observacion_documentos ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.sol_prueba_ruta))}</td>
                  <td className={`${td}`}>{r.asesor ?? ""}</td>
                  <td className={`${td}`}>{r.nombre_cliente ?? ""}</td>
                  <td className={`${td}`}>{r.cel_cliente ?? ""}</td>
                  <td className={`${td}`}>
                    {formatDateOnly(r.fec_tecno ?? undefined)}
                  </td>
                  <td className={`${td}`}>{renderSiNo(Number(r.tecno))}</td>
                  <td className={tdObs}>{r.observacion_tecno ?? ""}</td>
                  <td className={`${td}`}>
                    {formatDateOnly(r.fec_soat ?? undefined)}
                  </td>
                  <td className={`${td}`}>{renderSiNo(Number(r.soat))}</td>
                  <td className={tdObs}>{r.observacion_soat ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.dir_delanteras))}</td>
                  <td className={tdObs}>{r.observacion_dir_del ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.dir_traseras))}</td>
                  <td className={tdObs}>{r.observacion_dir_tra ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.luces_altas))}</td>
                  <td className={tdObs}>{r.observacion_altas ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.luces_bajas))}</td>
                  <td className={tdObs}>{r.observacion_bajas ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.stops))}</td>
                  <td className={tdObs}>{r.observacion_stops ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.luces_reversa))}</td>
                  <td className={tdObs}>{r.observacion_reversa ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.luces_parqueo))}</td>
                  <td className={tdObs}>{r.observacion_parqueo ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.luces_internas))}</td>
                  <td className={tdObs}>{r.observacion_internas ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.limpia_parabrisas))}</td>
                  <td className={tdObs}>{r.observacion_plumilla ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.pito))}</td>
                  <td className={tdObs}>{r.observacion_pito ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.sist_direccion))}</td>
                  <td className={tdObs}>{r.observacion_sist_dir ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.cinturones))}</td>
                  <td className={tdObs}>{r.observacion_cintu_seg ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.airbag))}</td>
                  <td className={tdObs}>{r.observacion_airbag ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.frenos_princ))}</td>
                  <td className={tdObs}>{r.observacion_frenos_prin ?? ""}</td>
                  <td className={`${td}`}>
                    {renderSiNo(Number(r.frenos_emergencia))}
                  </td>
                  <td className={tdObs}>{r.observacion_frenos_emerg ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.llantas))}</td>
                  <td className={tdObs}>{r.observacion_llantas ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.llanta_repto))}</td>
                  <td className={tdObs}>{r.observacion_llanta_repto ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.espejos))}</td>
                  <td className={tdObs}>{r.observacion_espejos ?? ""}</td>
                  <td className={`${td}`}>
                    {renderSiNo(Number(r.nivel_fluidos_frenos))}
                  </td>
                  <td className={tdObs}>{r.observacion_fluidos_frenos ?? ""}</td>
                  <td className={`${td}`}>
                    {renderSiNo(Number(r.nivel_fluidos_aceite))}
                  </td>
                  <td className={tdObs}>{r.observacion_fluidos_aceite ?? ""}</td>
                  <td className={`${td}`}>
                    {renderSiNo(Number(r.nivel_fluidos_refrigerante))}
                  </td>
                  <td className={tdObs}>{r.observacion_fluidos_refrig ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.extintor))}</td>
                  <td className={`${td}`}>
                    {formatDateOnly(r.fec_extintor ?? undefined)}
                  </td>
                  <td className={tdObs}>{r.observacion_extintor ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.kit_carretera))}</td>
                  <td className={tdObs}>{r.observacion_kit_carretera ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.botiquin))}</td>
                  <td className={tdObs}>{r.observacion_botiquin ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.quinta_rueda))}</td>
                  <td className={tdObs}>{r.observacion_quinta_rueda ?? ""}</td>
                  <td className={`${td}`}>{renderSiNo(Number(r.mangueras))}</td>
                  <td className={tdObs}>{r.observacion_mangueras_aire ?? ""}</td>
                  <td className={`${td}`}>{r.nivel_combustible ?? ""}</td>
                  <td className={`${td}`}>{r.kilometraje_salida ?? ""}</td>
                  <td className={`${td}`}>{r.kilometraje_llegada ?? ""}</td>
                  <td className={tdObs}>{r.observacion_general ?? ""}</td>
                  <td className={`${td} w-21 max-w-21`}>
                    <button
                      type="button"
                      onClick={() => openImagesModal(r.id)}
                      title="Ver imágenes"
                      className="w-full inline-flex items-center justify-center px-1 py-1 rounded-lg bg-(--color-primary) text-white text-[9px] font-medium leading-tight hover:bg-(--color-primary-dark)"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {hasAppliedSearch && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-start">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </motion.div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalId(null);
        }}
        title="Imágenes checklist"
        width="900px"
      >
        {modalId == null ? (
          <div className="py-4 text-sm text-gray-500">
            No se ha seleccionado ningún registro.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["_SUV", "_PICKUP", "_SEDAN"].map((suffix, idx) => (
              <div key={suffix} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 py-2 text-xs font-medium text-gray-600 border-b border-gray-100">
                  Imagen {idx + 1}
                </div>
                <div className="w-full h-64 bg-gray-50 flex items-center justify-center">
                  <img
                    src={`${baseImgUrl}/${modalId}${suffix}.png`}
                    alt={`Checklist ${modalId} ${suffix}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

