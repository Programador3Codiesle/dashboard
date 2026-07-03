'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MpviGestionJefe } from "@/components/taller/mpvi/jefe/MpviGestionJefe";

function MpviJefeTallerInner() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("idCotizacion");
  const idCotizacion = idParam ? parseInt(idParam, 10) : null;
  const fromContact = idCotizacion != null && !Number.isNaN(idCotizacion);

  return (
    <MpviGestionJefe
      op={fromContact ? 2 : 1}
      initialIdCotizacion={fromContact ? idCotizacion : null}
      showBackLink={fromContact}
    />
  );
}

export default function MpviJefeTallerPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Gestión MPVI — Jefe de Taller</h1>
        <p className="text-gray-500 mt-1">Autorización de servicios y cotizaciones MPVI</p>
      </div>
      <Suspense fallback={<div className="text-gray-500">Cargando...</div>}>
        <MpviJefeTallerInner />
      </Suspense>
    </div>
  );
}
