'use client';

import { EmpresaBadge } from '@/components/shared/brand/EmpresaBadge';

export function ComisionesLypPorNitPlaceholder() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Comisiones LYP por NIT
        </h1>
        <EmpresaBadge />
      </div>
      <p className="text-gray-600">
        Submódulo base creado. Pendiente migración desde legacy (controlador,
        vista y modelo).
      </p>
    </div>
  );
}
