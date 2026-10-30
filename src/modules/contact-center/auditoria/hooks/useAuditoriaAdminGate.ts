'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { catalogQueryOptions } from '@/core/query/catalog-query-options';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { AUDITORIA_CC_SUBMENU_ID } from '@/utils/constants';
import { auditoriaContactService } from '../services/auditoria-contact.service';

/** Crear, configurar e informe: perfiles 1, 20, 54 o NIT 37542439. El agente va al listado. */
export function useAuditoriaAdminGate() {
  const router = useRouter();
  const { user, blocked } = useContactCenterPageGuard(AUDITORIA_CC_SUBMENU_ID);
  const contextoQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'contexto'],
    queryFn: () => auditoriaContactService.obtenerContexto(),
    enabled: !!user && !blocked,
    ...catalogQueryOptions,
  });

  const esAdmin = contextoQuery.data?.esAdmin === true;

  useEffect(() => {
    if (contextoQuery.data && !contextoQuery.data.esAdmin) {
      router.replace('/dashboard/contact-center/auditoria/listado');
    }
  }, [contextoQuery.data, router]);

  return {
    user,
    blocked: blocked || !esAdmin,
    esAdmin,
  };
}
