'use client';

import React from 'react';
import { TableRow } from '@/components/shared/ui/TableRow';
import { SolicitudCompra } from '@/modules/administracion/services/gestion-compras.service';
import {
  etiquetaAutorizacion,
  puedeCambiarEstadoCompra,
  puedeMarcarFactura,
  puedePulsarAutorizacion,
} from '@/modules/administracion/gestion-compras/opciones-legacy';
import { MessageSquare, Eye } from 'lucide-react';

interface SolicitudCompraTableRowProps {
  solicitud: SolicitudCompra;
  getUrgenciaBadge: (urgencia: number) => string;
  onRefresh?: () => void;
  onVerDetalle?: (solicitud: SolicitudCompra) => void;
  onVerMensajes?: (solicitudId: number, estado: number) => void;
  onCambiarEstado?: (solicitudId: number, estadoActual: number) => void;
  onEnviarAutorizacion?: (solicitudId: number) => void;
  onVerCotizacion?: (solicitud: SolicitudCompra) => void;
  onToggleFactura?: (solicitudId: number, conFactura: boolean) => void;
  puedeOperar?: boolean;
}

/**
 * Componente memoizado para filas de tabla de solicitudes de compra
 */
export const SolicitudCompraTableRow = React.memo(({
  solicitud,
  getUrgenciaBadge,
  onVerDetalle,
  onVerMensajes,
  onCambiarEstado,
  onEnviarAutorizacion,
  onVerCotizacion,
  onToggleFactura,
  puedeOperar = false,
}: SolicitudCompraTableRowProps) => {
  const facturaHabilitada = puedeMarcarFactura(
    solicitud.estadoNumero,
    solicitud.conFactura,
    puedeOperar,
  );
  const estadoHabilitado = puedeCambiarEstadoCompra(
    solicitud.estadoNumero,
    puedeOperar,
  );
  const autorizacionHabilitada = puedePulsarAutorizacion(
    solicitud.estadoAutorizacionNumero,
    puedeOperar,
  );

  const handleToggleFactura = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!facturaHabilitada || !e.target.checked) return;
    onToggleFactura?.(solicitud.id, true);
  };

  const colorFila =
    solicitud.conFactura || solicitud.estadoNumero === 5
      ? '#DFDFDF'
      : solicitud.urgencia === 1
        ? '#D7FFCE'
        : solicitud.urgencia === 2
          ? '#FFFECE'
          : solicitud.urgencia === 3
            ? '#FFCECE'
            : undefined;

  const handleAutorizacion = () => {
    if (!autorizacionHabilitada) return;
    if (solicitud.estadoAutorizacionNumero === 3) {
      onVerCotizacion?.(solicitud);
      return;
    }
    onEnviarAutorizacion?.(solicitud.id);
  };

  return (
    <TableRow
      className="border-b border-gray-200 text-sm"
      style={colorFila ? { backgroundColor: colorFila } : undefined}
    >
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
          onClick={() => onVerMensajes?.(solicitud.id, solicitud.estadoNumero)}
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
            disabled={!facturaHabilitada}
            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 disabled:cursor-not-allowed"
          />
        </label>
      </td>
      <td className="py-4 px-6">
        <button
          type="button"
          onClick={() => onCambiarEstado?.(solicitud.id, solicitud.estadoNumero)}
          disabled={!estadoHabilitado}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
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
          type="button"
          onClick={handleAutorizacion}
          disabled={!autorizacionHabilitada}
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
          {etiquetaAutorizacion(solicitud.estadoAutorizacionNumero, puedeOperar)}
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
    prevProps.solicitud.urgencia === nextProps.solicitud.urgencia &&
    prevProps.solicitud.estadoNumero === nextProps.solicitud.estadoNumero &&
    prevProps.solicitud.cotizacionFile === nextProps.solicitud.cotizacionFile &&
    prevProps.puedeOperar === nextProps.puedeOperar &&
    prevProps.getUrgenciaBadge === nextProps.getUrgenciaBadge
  );
});

SolicitudCompraTableRow.displayName = 'SolicitudCompraTableRow';
