'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RepuestosPageFrame } from '@/modules/repuestos/components/RepuestosPageFrame';
import { REPUESTOS_COPY } from '@/modules/repuestos/constants';
import {
  FILTROS_EV_VACIOS,
  FiltrosEvBar,
  type BodegaEvOption,
  toEvListarPayload,
} from '@/modules/repuestos/shared/components/FiltrosEvBar';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { INFORME_EV_SV_SUBMENU_ID } from '@/utils/constants';
import { informeEvSvService } from '../services/informe-ev-sv.service';

const colorMap = {
  amarillo: 'bg-yellow-100',
  morado: 'bg-purple-100',
  rojo: 'bg-red-100',
  verde: 'bg-green-100',
};

export function InformeEvSvGestion() {
  const { blocked } = useRepuestosPageGuard(INFORME_EV_SV_SUBMENU_ID);
  const [filtros, setFiltros] = useState(FILTROS_EV_VACIOS);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_EV_VACIOS);
  const [consulta, setConsulta] = useState(0);

  const { data: bodegas = [] } = useQuery<BodegaEvOption[]>({
    queryKey: ['repuestos', 'informe-ev-sv', 'bodegas'],
    queryFn: () => informeEvSvService.listarBodegas(),
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ['repuestos', 'informe-ev-sv', filtrosAplicados, consulta],
    queryFn: () => informeEvSvService.listar(toEvListarPayload(filtrosAplicados)),
    enabled: consulta > 0,
  });

  if (blocked) return null;

  return (
    <RepuestosPageFrame
      title={REPUESTOS_COPY.informeEvSv.title}
      description={REPUESTOS_COPY.informeEvSv.description}
    >
    <div className="space-y-4">
      <FiltrosEvBar
        filtros={filtros}
        onChange={setFiltros}
        bodegas={bodegas}
        onBuscar={() => {
          setFiltrosAplicados(filtros);
          setConsulta((n) => n + 1);
        }}
      />

      <div className="app-table-scroll">
        <table className="w-full min-w-[1400px] text-xs md:text-sm text-center">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {['Solicitud', 'Orden', 'Placa', 'Bodega', 'Solicita', 'Autoriza', 'Gestión Repuestos', 'Gestión Bodega'].map((h) => (
                <th key={h} className="px-2 py-2 text-center font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="py-8 text-center text-gray-500">Cargando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-gray-500">Sin resultados</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className={`border-t ${colorMap[row.colorEstado]}`}>
                  <td className="px-2 py-2 text-center">{row.id}</td>
                  <td className="px-2 py-2 text-center">{row.nOrden}</td>
                  <td className="px-2 py-2 text-center">{row.placa}</td>
                  <td className="px-2 py-2 text-center">{row.bodega}</td>
                  <td className="px-2 py-2 text-center min-w-[140px] whitespace-normal break-words">{row.solicitadoPor}</td>
                  <td className="px-2 py-2 text-center min-w-[140px] whitespace-normal break-words">{row.autorizadoPor}</td>
                  <td className="px-2 py-2 text-center min-w-[170px]">
                    {row.gestionRepuestos.length === 0 ? 'PENDIENTE' : (
                      <table className="text-xs w-full text-center">
                        <thead><tr><th>EV</th><th>SV</th><th>OT SV</th></tr></thead>
                        <tbody>
                          {row.gestionRepuestos.map((g, i) => (
                            <tr key={i} className={g.pendiente ? 'bg-red-100' : ''}>
                              <td>{g.ev}</td><td>{g.sv}</td><td>{g.otSv}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center min-w-[170px]">
                    {row.gestionBodega.length === 0 ? 'PENDIENTE' : (
                      <table className="text-xs w-full text-center">
                        <thead><tr><th>OT</th><th>Ent.</th><th>No ent.</th></tr></thead>
                        <tbody>
                          {row.gestionBodega.map((g, i) => (
                            <tr key={i} className={g.pendiente ? 'bg-red-100' : ''}>
                              <td>{g.nOrden}</td><td>{g.entregados}</td><td>{g.noEntregados}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </RepuestosPageFrame>
  );
}
