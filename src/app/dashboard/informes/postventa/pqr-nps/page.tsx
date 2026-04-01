'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pqrNpsService, EstadoPqr, PqrNpsItem } from '@/modules/informes/postventa/services/pqr-nps.service';
import { useToast } from '@/components/shared/ui/ToastContext';

export default function PqrNpsPage() {
  const [estado, setEstado] = useState<EstadoPqr>('abiertos');
  const { showError } = useToast();

  const { data, isLoading, error } = useQuery<PqrNpsItem[], Error>({
    queryKey: ['pqr-nps', estado],
    queryFn: () => pqrNpsService.listar(estado),
  });

  const items = data ?? [];

  useEffect(() => {
    if (error) {
      showError('No se pudo cargar el informe de PQR.');
    }
  }, [error, showError]);

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

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6 flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Estado del caso</p>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoPqr)}
            className="rounded-md border-gray-300 text-sm px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
          >
            <option value="abiertos">Abiertos</option>
            <option value="cerrados">Cerrados</option>
            <option value="todos">Todos (pendiente implementar)</option>
          </select>
        </div>

        <div className="text-xs text-gray-500">
          {isLoading ? 'Cargando registros...' : `Total registros: ${items.length}`}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border overflow-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-[--color-primary] text-white">
            <tr>
              <th className="px-2 py-2 text-left">Fuente</th>
              <th className="px-2 py-2 text-left">ID</th>
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
              <th className="px-2 py-2 text-left">Satisf. Concesionario</th>
              <th className="px-2 py-2 text-left">Satisf. Trabajo</th>
              <th className="px-2 py-2 text-left">VH reparado ok</th>
              <th className="px-2 py-2 text-left">Recom. Marca</th>
              <th className="px-2 py-2 text-left">Técnico</th>
              <th className="px-2 py-2 text-left">Tipificación encuesta</th>
              <th className="px-2 py-2 text-left">Estado caso</th>
              <th className="px-2 py-2 text-left">Tipificación cierre</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={`${row.fuente}-${row.id}`} className="border-b last:border-b-0">
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
                <td className="px-2 py-1">{row.tecnico}</td>
                <td className="px-2 py-1">{row.tipificacionEncuesta ?? 'Gestionar'}</td>
                <td className="px-2 py-1">{row.estadoCaso ?? 'Gestionar'}</td>
                <td className="px-2 py-1">{row.tipificacionCierre ?? 'Gestionar'}</td>
              </tr>
            ))}

            {!isLoading && items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500 text-sm" colSpan={20}>
                  No hay registros para el estado seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

