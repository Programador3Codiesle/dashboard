import { Suspense } from "react";
import { MpviJefeTallerGestion } from "@/modules/taller/mpvi/components/MpviJefeTallerGestion";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-gray-500">Cargando...</div>}>
      <MpviJefeTallerGestion />
    </Suspense>
  );
}
