"use client";

import { memo } from "react";

function DashboardEmptyInner() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[40vh] text-center">
      <p className="text-gray-500 text-lg">
        No tienes acceso al dashboard principal con tu perfil actual.
      </p>
      <p className="text-gray-400 text-sm mt-2">
        Utiliza el menú para acceder a las secciones disponibles.
      </p>
    </div>
  );
}

export const DashboardEmpty = memo(DashboardEmptyInner);
