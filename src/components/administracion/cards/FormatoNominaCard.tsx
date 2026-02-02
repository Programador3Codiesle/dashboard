'use client';

import React from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { FormatoNominaAPI } from '@/modules/administracion/services/formatos-nomina.service';

interface FormatoNominaCardProps {
  formato: FormatoNominaAPI;
  descargando: boolean;
  onDescargar: (id: number, nombre: string) => void;
}

/**
 * Componente memoizado para tarjetas de formatos de nómina
 * Evita re-renders innecesarios
 */
export const FormatoNominaCard = React.memo(({
  formato,
  descargando,
  onDescargar
}: FormatoNominaCardProps) => {
  const handleClick = React.useCallback(() => {
    onDescargar(formato.id, formato.nombre);
  }, [formato.id, formato.nombre, onDescargar]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-xl">
          <FileText className="text-blue-600" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{formato.nombre}</h3>
          <p className="text-sm text-gray-500 mb-4">{formato.descripcion}</p>
          <button
            onClick={handleClick}
            disabled={descargando}
            className="flex items-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {descargando ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Descargando...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Descargar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.formato.id === nextProps.formato.id &&
    prevProps.descargando === nextProps.descargando &&
    prevProps.onDescargar === nextProps.onDescargar
  );
});

FormatoNominaCard.displayName = 'FormatoNominaCard';
