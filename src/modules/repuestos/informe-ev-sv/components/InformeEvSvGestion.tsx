'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  btnPrimaryClass,
  inputClass,
} from '@/modules/repuestos/shared/constants/ui';
import { informeEvSvService } from '../services/informe-ev-sv.service';

const colorMap = {
  amarillo: 'bg-yellow-100',
  morado: 'bg-purple-100',
  rojo: 'bg-red-100',
  verde: 'bg-green-100',
};

export function InformeEvSvGestion() {
  const [filtros, setFiltros] = useState({
    nOrden: '',
    placa: '',
    bodega: '',
    fechaRegistro: '',
  });
  const [buscar, setBuscar] = useState(false);

  const { data: bodegas = [] } = useQuery({
    queryKey: ['repuestos', 'informe-ev-sv', 'bodegas'],
    queryFn: () => informeEvSvService.listarBodegas(),
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ['repuestos', 'informe-ev-sv', filtros, buscar],
    queryFn: () =>
      informeEvSvService.listar({
        nOrden: filtros.nOrden ? Number(filtros.nOrden) : undefined,
        placa: filtros.placa || undefined,
        bodega: filtros.bodega ? Number(filtros.bodega) : undefined,
        fechaRegistro: filtros.fechaRegistro || undefined,
      }),
    enabled: buscar,
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
        <input type="number" placeholder="N° Orden" className={inputClass} value={filtros.nOrden} onChange={(e) => setFiltros((f) => ({ ...f, nOrden: e.target.value }))} />
        <input placeholder="Placa" className={inputClass} value={filtros.placa} onChange={(e) => setFiltros((f) => ({ ...f, placa: e.target.value.toUpperCase() }))} />
        <select className={inputClass} value={filtros.bodega} onChange={(e) => setFiltros((f) => ({ ...f, bodega: e.target.value }))}>
          <option value="">Bodega</option>
          {bodegas.map((b: { bodega: number; descripcion: string }) => (
            <option key={b.bodega} value={b.bodega}>{b.descripcion}</option>
          ))}
        </select>
        <input type="date" className={inputClass} value={filtros.fechaRegistro} onChange={(e) => setFiltros((f) => ({ ...f, fechaRegistro: e.target.value }))} />
        <button type="button" className={btnPrimaryClass} onClick={() => setBuscar(true)}>Buscar</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto max-h-[70vh]">
        <table className="min-w-full text-xs md:text-sm text-center">
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
  );
}
