'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import { inputClass } from '@/modules/contact-center/shared/constants/ui';

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

  useEffect(() => {
    setLocal(distribucion != null ? String(distribucion) : '');
  }, [distribucion]);

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
      className={`${inputClass} w-16 text-center`}
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
