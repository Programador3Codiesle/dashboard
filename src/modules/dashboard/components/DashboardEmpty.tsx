"use client";

import { memo } from "react";
import { formatNombre } from "@/utils/format-nombre";
import { DASHBOARD_COPY } from "../constants";

function DashboardEmptyInner({
  userName,
  perfil,
}: {
  userName?: string;
  perfil?: string;
}) {
  const formatted = userName?.trim() ? formatNombre(userName) : "";
  const primerNombre = formatted.split(/\s+/).filter(Boolean)[0];
  const titulo = primerNombre
    ? `Bienvenido, ${primerNombre}`
    : DASHBOARD_COPY.emptyTitle;

  return (
    <section
      data-testid="dashboard-welcome"
      className="flex min-h-[40vh] items-center justify-center p-4 sm:p-6"
      aria-labelledby="dashboard-welcome-title"
    >
      <div className="max-w-lg rounded-2xl border bg-white p-6 text-center shadow-sm brand-card-surface sm:p-8">
        <h1
          id="dashboard-welcome-title"
          className="app-title-xl brand-text"
        >
          {titulo}
        </h1>
        {perfil?.trim() ? (
          <p className="mt-2 text-sm font-medium text-gray-500">{perfil.trim()}</p>
        ) : null}
        <p className="mt-3 text-sm text-gray-600 sm:text-base">
          {DASHBOARD_COPY.emptyHint}
        </p>
      </div>
    </section>
  );
}

export const DashboardEmpty = memo(DashboardEmptyInner);
