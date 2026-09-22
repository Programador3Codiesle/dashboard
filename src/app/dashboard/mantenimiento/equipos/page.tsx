'use client';

import dynamic from 'next/dynamic';

const EquiposGestion = dynamic(
  () =>
    import('@/modules/mantenimiento/equipos/components/EquiposGestion').then(
      (mod) => mod.EquiposGestion,
    ),
  { ssr: false },
);

export default function Page() {
  return <EquiposGestion />;
}
