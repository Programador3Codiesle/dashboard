'use client';

import { memo, useCallback, useState } from 'react';

type Props = {
  agente: number;
  bodega: number;
  asignado: boolean;
  distribucion: number | null;
  onSave: (payload: {
    agente: number;
    bodega: number;
    distribucion: number;
  }) => void;
};

export const DistribucionPorcentajeInput = memo(function DistribucionPorcentajeInput({
  agente,
  bodega,
  asignado,
  distribucion,
  onSave,
}: Props) {
  const [local, setLocal] = useState(
    distribucion != null ? String(distribucion) : '',
  );

  const commit = useCallback(() => {
    const val = Number(local);
    if (Number.isNaN(val)) return;
    onSave({ agente, bodega, distribucion: val });
  }, [agente, bodega, local, onSave]);

  return (
    <input
      type="number"
      min={0}
      max={100}
      className="w-16 rounded-lg border border-gray-300 bg-white px-1 py-1 text-center text-sm focus:outline-none brand-focus-ring disabled:bg-gray-100"
      value={local}
      disabled={!asignado}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
      }}
    />
  );
});
