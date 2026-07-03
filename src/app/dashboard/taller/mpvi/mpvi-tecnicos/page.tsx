'use client';

import { MpviGestionTecnico } from "@/components/taller/mpvi/tecnicos/MpviGestionTecnico";

export default function MpviTecnicosPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Gestión MPVI — Técnicos</h1>
        <p className="text-gray-500 mt-1">Cotización y registro de ítems MPVI por placa</p>
      </div>
      <MpviGestionTecnico />
    </div>
  );
}
