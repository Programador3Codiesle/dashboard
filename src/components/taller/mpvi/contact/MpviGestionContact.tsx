"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/shared/atoms/Button";
import Modal from "@/components/shared/ui/Modal";
import {
  useMpviContactActions,
  useMpviCotizaciones,
} from "@/modules/taller/mpvi/hooks/useMpviContact";
import type { MpviCotizacionContact } from "@/modules/taller/mpvi/types";

export function MpviGestionContact() {
  const router = useRouter();
  const [placaFiltro, setPlacaFiltro] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<{ placa?: string }>({});
  const [descartarTarget, setDescartarTarget] = useState<MpviCotizacionContact | null>(null);

  const { cotizaciones, loading, refetch } = useMpviCotizaciones(filtroActivo);
  const { descartar } = useMpviContactActions();

  const handleBuscar = () => {
    setFiltroActivo(placaFiltro.trim() ? { placa: placaFiltro.trim().toUpperCase() } : {});
  };

  const handleGestionar = (id: number) => {
    router.push(`/dashboard/taller/mpvi/mpvi-jefe-taller?idCotizacion=${id}`);
  };

  const confirmarDescartar = () => {
    if (!descartarTarget) return;
    descartar.mutate(descartarTarget.id, {
      onSuccess: () => {
        setDescartarTarget(null);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="brand-card-surface rounded-2xl border brand-border-active brand-card-elevated p-4 sm:p-6 transition-all">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium mb-1">Filtrar por placa</label>
            <input
              type="text"
              maxLength={6}
              placeholder="Opcional — vacío lista todas"
              className="w-full rounded-lg border px-3 py-2 text-sm uppercase"
              value={placaFiltro}
              onChange={(e) => setPlacaFiltro(e.target.value.toUpperCase())}
            />
          </div>
          <Button className="brand-btn flex items-center gap-2" onClick={handleBuscar}>
            <Search size={18} />
            Buscar
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 mt-4 text-gray-600">
            <Loader2 className="animate-spin" size={18} />
            <span>Cargando cotizaciones...</span>
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 border-b">N° Cotización</th>
                <th className="px-3 py-2 border-b">Placa</th>
                <th className="px-3 py-2 border-b">Nombre</th>
                <th className="px-3 py-2 border-b">Celular</th>
                <th className="px-3 py-2 border-b">Correo</th>
                <th className="px-3 py-2 border-b">Técnico</th>
                <th className="px-3 py-2 border-b">Nota</th>
                <th className="px-3 py-2 border-b">Fecha contacto</th>
                <th className="px-3 py-2 border-b text-center">Días rest.</th>
                <th className="px-3 py-2 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-gray-500">
                    No hay cotizaciones pendientes de contacto
                  </td>
                </tr>
              )}
              {cotizaciones.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50 transition-all">
                  <td className="px-3 py-2">{c.id}</td>
                  <td className="px-3 py-2">{c.placa}</td>
                  <td className="px-3 py-2">{c.nombre}</td>
                  <td className="px-3 py-2">{c.celular}</td>
                  <td className="px-3 py-2">{c.correo}</td>
                  <td className="px-3 py-2">{c.tecnico}</td>
                  <td className="px-3 py-2 max-w-[160px] truncate" title={c.nota}>
                    {c.nota}
                  </td>
                  <td className="px-3 py-2">{c.fechaContacto}</td>
                  <td className="px-3 py-2 text-center">{c.diasRestantes}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-2">
                      <Button className="brand-btn text-xs px-2 py-1" onClick={() => handleGestionar(c.id)}>
                        Gestionar
                      </Button>
                      <button
                        type="button"
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Descartar"
                        onClick={() => setDescartarTarget(c)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!descartarTarget}
        onClose={() => setDescartarTarget(null)}
        title="Descartar cotización"
      >
        <p className="text-gray-600 mb-4">
          ¿Desea descartar la cotización #{descartarTarget?.id} de la placa {descartarTarget?.placa}?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDescartarTarget(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={descartar.isPending}
            onClick={confirmarDescartar}
          >
            {descartar.isPending ? "Descartando..." : "Descartar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
