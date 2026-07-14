'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const URLS: Record<string, string> = {
  motocicletas: 'https://intranet.codiesel.co/ventas/CheckMoto',
  vehiculo: 'https://intranet.codiesel.co/ventas/CheckCarro',
};

export function ChecklistExternalRedirect({ tipo }: { tipo: keyof typeof URLS }) {
  const router = useRouter();

  useEffect(() => {
    window.open(URLS[tipo], '_blank', 'noopener,noreferrer');
    router.replace('/dashboard/checklist');
  }, [tipo, router]);

  return (
    <p className="py-8 text-center text-sm text-gray-500">
      Abriendo el sistema de ventas en una nueva pestaña...
    </p>
  );
}
