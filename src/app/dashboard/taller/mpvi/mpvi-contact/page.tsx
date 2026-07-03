'use client';

import { MpviGestionContact } from "@/components/taller/mpvi/contact/MpviGestionContact";

export default function MpviContactPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Gestión MPVI — Contact</h1>
        <p className="text-gray-500 mt-1">Seguimiento de cotizaciones pendientes de contacto</p>
      </div>
      <MpviGestionContact />
    </div>
  );
}
