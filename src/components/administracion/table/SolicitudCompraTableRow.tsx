'use client';

import React from 'react';
import { TableRow } from '@/components/shared/ui/TableRow';
import { SolicitudCompra } from '@/modules/administracion/services/gestion-compras.service';
import { MessageSquare, Eye } from 'lucide-react';

interface SolicitudCompraTableRowProps {
  solicitud: SolicitudCompra;
  getUrgenciaBadge: (urgencia: number) => string;
  onRefresh?: () => void;
  onVerDetalle?: (solicitud: SolicitudCompra) => void;
  onVerMensajes?: (solicitudId: number) => void;
  onCambiarEstado?: (solicitudId: number, estadoActual: number) => void;
  onEnviarAutorizacion?: (solicitudId: number) => void;
  onToggleFactura?: (solicitudId: number, conFactura: boolean) => void;
}

/**
 * Componente memoizado para filas de tabla de solicitudes de compra
 */
export const SolicitudCompraTableRow = React.memo(({
  solicitud,
  getUrgenciaBadge,
  onRefresh,
  onVerDetalle,
  onVerMensajes,
  onCambiarEstado,
  onEnviarAutorizacion,
  onToggleFactura,
}: SolicitudCompraTableRowProps) => {
  const handleToggleFactura = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onToggleFactura) {
      onToggleFactura(solicitud.id, e.target.checked);
    }
  };

  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50 text-sm">
      <td className="py-4 px-6">
        <button
          onClick={() => onVerDetalle?.(solicitud)}
          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
        >
          <Eye className="w-3 h-3 mr-1" />
          {solicitud.numero}
        </button>
      </td>
      <td className="py-4 px-6">{solicitud.descripcion}</td>
      <td className="py-4 px-6">
        <button
          onClick={() => onVerMensajes?.(solicitud.id)}
          className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
        >
          <MessageSquare className="w-3 h-3 mr-1" />
          Mensajes
        </button>
      </td>
      <td className="py-4 px-6">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={solicitud.conFactura}
            onChange={handleToggleFactura}
            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
          />
        </label>
      </td>
      <td className="py-4 px-6">
        <button
          onClick={() => onCambiarEstado?.(solicitud.id, solicitud.estadoNumero)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            solicitud.estadoNumero === 1
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : solicitud.estadoNumero === 2
              ? 'brand-bg brand-bg-hover text-white shadow-sm'
              : solicitud.estadoNumero === 3
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : solicitud.estadoNumero === 4
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          {solicitud.estado}
        </button>
      </td>
      <td className="py-4 px-6">
        <button
          onClick={() => onEnviarAutorizacion?.(solicitud.id)}
          disabled={solicitud.estadoAutorizacionNumero === 3 || solicitud.estadoAutorizacionNumero === 4}
          className={`px-2 py-1 rounded text-xs font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
            solicitud.estadoAutorizacionNumero === 1
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : solicitud.estadoAutorizacionNumero === 2
              ? 'brand-bg brand-bg-hover text-white shadow-sm'
              : solicitud.estadoAutorizacionNumero === 3
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          {solicitud.estadoAutorizacion}
        </button>
      </td>
      <td className="py-4 px-6">{solicitud.usuarioSolicita}</td>
      <td className="py-4 px-6">{solicitud.gerenteAutoriza}</td>
      <td className="py-4 px-6 text-gray-600">{solicitud.fechaSolicitud}</td>
      <td className="py-4 px-6 text-gray-600">{solicitud.fechaAutorizacion || "-"}</td>
      <td className="py-4 px-6">{solicitud.gestionDias}</td>
      <td className="py-4 px-6">
        <span className={`px-1 py-1 rounded text-xs font-medium border ${getUrgenciaBadge(solicitud.urgencia)}`}>
          Urgencia {solicitud.urgencia}
        </span>
      </td>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.solicitud.id === nextProps.solicitud.id &&
    prevProps.solicitud.estado === nextProps.solicitud.estado &&
    prevProps.solicitud.estadoAutorizacion === nextProps.solicitud.estadoAutorizacion &&
    prevProps.solicitud.conFactura === nextProps.solicitud.conFactura &&
    prevProps.getUrgenciaBadge === nextProps.getUrgenciaBadge
  );
});

SolicitudCompraTableRow.displayName = 'SolicitudCompraTableRow';
