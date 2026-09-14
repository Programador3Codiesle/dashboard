'use client';

import { useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { getUser } from '@/utils/cookies';
import { applyEmpresaFavicon } from '@/core/theme/apply-empresa-favicon';

export function EmpresaThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    const empresaId = user?.empresa ?? getUser()?.empresa ?? null;
    const el = document.documentElement;
    if (empresaId != null) {
      el.setAttribute('data-empresa', String(empresaId));
    } else {
      el.removeAttribute('data-empresa');
    }
    applyEmpresaFavicon(empresaId);
  }, [user?.empresa]);

  return <>{children}</>;
}
