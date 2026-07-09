'use client';

import { memo } from 'react';
import {
  FormularioAuditoria,
  IndicadorAuditoria,
} from '../services/auditoria-contact.service';

type Props = {
  formulario: FormularioAuditoria;
  readonly?: boolean;
  onRespuesta?: (itemId: number, opt: 1 | 2 | 3) => void;
};

const IndicadorBlock = memo(function IndicadorBlock({
  indicador,
  readonly,
  onRespuesta,
}: {
  indicador: IndicadorAuditoria;
  readonly?: boolean;
  onRespuesta?: (itemId: number, opt: 1 | 2 | 3) => void;
}) {
  if (indicador.estado === 1 || indicador.items.length === 0) return null;

  return (
    <>
      <tr>
        <th
          colSpan={5}
          className="bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800"
        >
          {indicador.nombres}
        </th>
      </tr>
      {indicador.items.map((item) => (
        <tr key={item.idItem} className="border-t">
          <td className="px-3 py-2 w-[30%]" />
          <td className="px-3 py-2 w-[40%]">{item.concepto}</td>
          {([1, 2, 3] as const).map((opt) => (
            <td key={opt} className="px-3 py-2 text-center w-[10%]">
              <input
                type="radio"
                name={`item-${item.idItem}`}
                checked={item.respuesta === opt}
                disabled={readonly}
                onChange={() => onRespuesta?.(item.idItem, opt)}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
});

export const AuditoriaFormulario = memo(function AuditoriaFormulario({
  formulario,
  readonly,
  onRespuesta,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-center w-[30%]">Indicador</th>
            <th className="px-3 py-2 text-center w-[40%]">Item</th>
            <th className="px-3 py-2 text-center w-[10%]">Sí</th>
            <th className="px-3 py-2 text-center w-[10%]">No</th>
            <th className="px-3 py-2 text-center w-[10%]">No Aplica</th>
          </tr>
        </thead>
        <tbody>
          {formulario.indicadores.map((ind) => (
            <IndicadorBlock
              key={ind.idIndicador}
              indicador={ind}
              readonly={readonly}
              onRespuesta={onRespuesta}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});
