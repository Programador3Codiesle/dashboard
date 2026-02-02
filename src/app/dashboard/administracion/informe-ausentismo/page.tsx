'use client';

import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, ChevronDown } from "lucide-react";
import { SEDES, AREAS_INFORME_AUSENTISMO } from "@/modules/administracion/constants";
import { Pagination } from "@/components/shared/ui/Pagination";
import { informeAusentismoService, AusentismoInforme } from "@/modules/administracion/services/informe-ausentismo.service";
import DetalleAusentismoModal from "@/components/administracion/modals/DetalleAusentismoModal";
import Modal from "@/components/shared/ui/Modal";
import { useToast } from "@/components/shared/ui/ToastContext";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { DateRangeFilter } from "@/components/administracion/filters/DateRangeFilter";
import { SelectFilter } from "@/components/shared/ui/SelectFilter";
import { AusentismoTableRow } from "@/components/administracion/table/AusentismoTableRow";

const PAGE_SIZE = 10;

/** Solo se re-renderiza cuando cambian datos/loading; evita parpadeo en header, filtros y paginación */
const TablaAusentismos = memo(function TablaAusentismos({
  ausentismos,
  ausentismosMostrados,
  loading,
  fechaInicio,
  fechaFin,
  onVerDetalle,
}: {
  ausentismos: AusentismoInforme[];
  ausentismosMostrados: AusentismoInforme[];
  loading: boolean;
  fechaInicio: string;
  fechaFin: string;
  onVerDetalle: (a: AusentismoInforme) => void;
}) {
  return (
    <div className="overflow-x-auto relative">
      {loading && ausentismos.length > 0 && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-b-xl">
          <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg shadow-md">
            <Loader2 className="animate-spin" size={20} />
            <span>Cargando...</span>
          </div>
        </div>
      )}
      <table className="w-full">
        <thead className="brand-bg border-b border-[var(--color-primary-dark)] text-sm">
          <tr>
            <th className="text-left py-4 px-6 font-semibold text-white">Gestionado Por</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Colaborador</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Sede</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Área</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Fecha Inicio</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Hora Inicio</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Fecha Fin</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Hora Fin</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Estado</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {loading && ausentismos.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-10">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Cargando ausentismos...</span>
                </div>
              </td>
            </tr>
          ) : !fechaInicio || !fechaFin ? (
            <tr>
              <td colSpan={10} className="text-center py-10 text-gray-500">
                Seleccione fecha de inicio y fecha final para generar el informe
              </td>
            </tr>
          ) : ausentismosMostrados.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-10 text-gray-500">
                No se encontraron resultados
              </td>
            </tr>
          ) : (
            ausentismosMostrados.map((ausentismo, index) => (
              <AusentismoTableRow
                key={`${ausentismo.id}-${index}`}
                ausentismo={ausentismo}
                onVerDetalle={onVerDetalle}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

/** Paginación memoizada: no se re-renderiza cuando solo cambian datos/loading de la tabla */
const PaginacionAusentismos = memo(function PaginacionAusentismos({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="p-4 border-t border-gray-200">
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={onChange} />
    </div>
  );
});

const HeaderSection = memo(function HeaderSection({ onGenerarInforme }: { onGenerarInforme: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Informe Ausentismo</h1>
        <p className="text-gray-500 mt-1">Informe detallado de ausentismo multiempresa</p>
      </div>
      <button
        onClick={onGenerarInforme}
        className="flex items-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
      >
        <FileText size={18} />
        <span>Generar Informe</span>
      </button>
    </div>
  );
});

const FiltersSection = memo(function FiltersSection({
  fechaInicio,
  fechaFin,
  filtroSede,
  filtroArea,
  onFechaInicioChange,
  onFechaFinalChange,
  onFiltroSedeChange,
  onFiltroAreaChange,
}: {
  fechaInicio: string;
  fechaFin: string;
  filtroSede: string;
  filtroArea: string;
  onFechaInicioChange: (v: string) => void;
  onFechaFinalChange: (v: string) => void;
  onFiltroSedeChange: (v: string) => void;
  onFiltroAreaChange: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DateRangeFilter
          fechaInicio={fechaInicio}
          fechaFinal={fechaFin}
          onFechaInicioChange={onFechaInicioChange}
          onFechaFinalChange={onFechaFinalChange}
          className="md:col-span-2"
        />
        <SelectFilter
          label="Sede"
          value={filtroSede}
          onChange={onFiltroSedeChange}
          options={SEDES.map((sede) => ({ value: sede, label: sede }))}
          placeholder="Todas"
        />
        <SelectFilter
          label="Área"
          value={filtroArea}
          onChange={onFiltroAreaChange}
          options={AREAS_INFORME_AUSENTISMO.map((area) => ({ value: area, label: area }))}
          placeholder="Todas"
        />
      </div>
    </motion.div>
  );
});

const SearchSection = memo(function SearchSection({
  onSearch,
  placeholder,
}: {
  onSearch: (v: string) => void;
  placeholder: string;
}) {
  return <SearchFilter onSearch={onSearch} placeholder={placeholder} />;
});

export default function InformeAusentismoPage() {
  const { showError } = useToast();
  const [search, setSearch] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroSede, setFiltroSede] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [ausentismoSeleccionado, setAusentismoSeleccionado] = useState<AusentismoInforme | null>(null);
  const [informeModalOpen, setInformeModalOpen] = useState(false);
  const [informeConfig, setInformeConfig] = useState({ desde: "", hasta: "", sede: "", area: "" });
  const [ausentismos, setAusentismos] = useState<AusentismoInforme[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const cargarAusentismos = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return;

    setLoading(true);
    try {
      const resultado = await informeAusentismoService.listar({
        fechaDesde: fechaInicio,
        fechaHasta: fechaFin,
        sede: filtroSede || undefined,
        area: filtroArea || undefined,
        empleado: search.trim() || undefined,
        pagina: currentPage,
        limite: PAGE_SIZE,
      });
      setAusentismos(resultado.items);
      setTotalItems(resultado.total);
    } catch (error) {
      console.error("Error al cargar ausentismos:", error);
      showError("Error al cargar el informe de ausentismo");
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, filtroSede, filtroArea, search, currentPage, showError]);

  useEffect(() => {
    if (filtroSede || filtroArea || search.trim()) {
      setCurrentPage(1);
    }
  }, [filtroSede, filtroArea, search]);

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarAusentismos();
    } else {
      setAusentismos([]);
      setTotalItems(0);
    }
  }, [fechaInicio, fechaFin, filtroSede, filtroArea, search, currentPage, cargarAusentismos]);

  const ausentismosMostrados = useMemo(() => ausentismos, [ausentismos]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleVerDetalle = useCallback((ausentismo: AusentismoInforme) => {
    setAusentismoSeleccionado(ausentismo);
    setDetalleModalOpen(true);
  }, []);

  const handleOpenInforme = useCallback(() => setInformeModalOpen(true), []);

  const handleGenerarInforme = () => {
    console.log("Generando informe con configuración:", informeConfig);
    setInformeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <HeaderSection onGenerarInforme={handleOpenInforme} />

      <FiltersSection
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        filtroSede={filtroSede}
        filtroArea={filtroArea}
        onFechaInicioChange={setFechaInicio}
        onFechaFinalChange={setFechaFin}
        onFiltroSedeChange={setFiltroSede}
        onFiltroAreaChange={setFiltroArea}
      />

      <SearchSection
        onSearch={setSearch}
        placeholder="Buscar por colaborador, gestionado por o motivo..."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <TablaAusentismos
          ausentismos={ausentismos}
          ausentismosMostrados={ausentismosMostrados}
          loading={loading}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onVerDetalle={handleVerDetalle}
        />
        <PaginacionAusentismos
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={changePage}
        />
      </motion.div>

      <DetalleAusentismoModal
        key={
          ausentismoSeleccionado
            ? `detalle-${ausentismoSeleccionado.id}-${ausentismoSeleccionado.colaborador}-${ausentismoSeleccionado.fechaInicio}-${ausentismoSeleccionado.horaInicio}`
            : "detalle-closed"
        }
        open={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setAusentismoSeleccionado(null);
        }}
        ausentismo={ausentismoSeleccionado}
      />

      {/* Modal Generar Informe */}
      <Modal open={informeModalOpen} onClose={() => setInformeModalOpen(false)} title="Generar Informe" width="500px">
        <div className="space-y-4 p-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white"
              value={informeConfig.desde}
              onChange={(e) => setInformeConfig({ ...informeConfig, desde: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white"
              value={informeConfig.hasta}
              onChange={(e) => setInformeConfig({ ...informeConfig, hasta: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
            <div className="relative">
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10"
                value={informeConfig.sede}
                onChange={(e) => setInformeConfig({ ...informeConfig, sede: e.target.value })}
              >
                <option value="">Todas</option>
                {SEDES.map((sede) => (
                  <option key={sede} value={sede}>{sede}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white"
              value={informeConfig.area}
              onChange={(e) => setInformeConfig({ ...informeConfig, area: e.target.value })}
              placeholder="Área (opcional)"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setInformeModalOpen(false)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerarInforme}
              className="px-5 py-2.5 brand-bg brand-bg-hover text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
            >
              Generar Informe
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
