'use client';

import { useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';

export function EmpresaThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    const el = document.documentElement;
    if (user?.empresa != null) {
      el.setAttribute('data-empresa', String(user.empresa));
    } else {
      el.removeAttribute('data-empresa');
    }
  }, [user?.empresa]);

  return <>{children}</>;
}
