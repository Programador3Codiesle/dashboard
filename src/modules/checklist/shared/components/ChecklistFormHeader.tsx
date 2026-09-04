'use client';

import { useAuth } from '@/core/auth/hooks/useAuth';
import { BYD_EMPRESA_ID, MITSUBISHI_EMPRESA_ID } from '@/utils/constants';
import { getChecklistEmpresaLogo } from '../constants/empresa-logo';

type Props = {
  tituloFormulario: string;
  codigoDocumento?: string;
};

export function ChecklistFormHeader({ tituloFormulario, codigoDocumento }: Props) {
  const { user } = useAuth();
  const logo = getChecklistEmpresaLogo(user?.empresa);
  const isMitsubishi = user?.empresa === MITSUBISHI_EMPRESA_ID;
  const isByd = user?.empresa === BYD_EMPRESA_ID;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col items-center gap-4 bg-white px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
        <div className="flex shrink-0 items-center justify-center px-2 py-1">
          <img
            src={logo.src}
            alt={`Logo ${logo.nombre}`}
            className={
              isMitsubishi
                ? 'h-16 w-auto max-w-full object-contain sm:h-20 sm:max-w-[240px]'
                : isByd
                  ? 'h-9 w-auto max-w-full object-contain sm:h-10 sm:max-w-[200px]'
                  : 'h-12 w-auto max-w-full object-contain sm:h-14 sm:max-w-[260px]'
            }
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <div className="hidden h-10 w-px shrink-0 bg-gray-200 sm:block" />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h5 className="text-sm font-semibold tracking-wide text-gray-900 sm:text-base">
            {tituloFormulario}
          </h5>
          {codigoDocumento && (
            <p className="mt-1 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
              {codigoDocumento}
            </p>
          )}
        </div>
      </div>
      <div className="h-1 w-full brand-bg" />
    </div>
  );
}
