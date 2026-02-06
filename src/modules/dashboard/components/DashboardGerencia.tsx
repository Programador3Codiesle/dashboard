"use client";

import { memo } from "react";
import { DashboardAdmin } from "./DashboardAdmin";
import type { DashboardGerencia as DashboardGerenciaType } from "../types";
import type { DashboardAdmin as DashboardAdminType } from "../types";

function DashboardGerenciaInner({ data }: { data: DashboardGerenciaType }) {
  const asAdmin: DashboardAdminType = {
    ...data,
    variant: "admin",
  };
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Gerencia</h2>
      <DashboardAdmin data={asAdmin} />
    </div>
  );
}

export const DashboardGerencia = memo(DashboardGerenciaInner);
